import {NextFunction, Request, Response} from "express";
import {decodeJwt, JWTPayload} from "jose";

export type Brukerinformasjon = {
    navn: string;
    ident: string;
    epost: string;
};

const lokalMockBruker: Brukerinformasjon = {
    navn: "Ansatt, Lokal",
    ident: "A123456",
    epost: "lokal.ansatt@nav.no",
};

export const hentBrukerinfoFraToken = (jwtPayload : JWTPayload) : Brukerinformasjon => {
    const navn = jwtPayload["name"] as string;
    const ident = jwtPayload["NAVident"] as string;
    const preferredUsername = jwtPayload["preferred_username"] as string;
    const tokenUtløper = jwtPayload["exp"] as number * 1000 // konverterer fra sekunder til ms
    return {
        navn: navn,
        ident: ident,
        epost: preferredUsername
    }
}

export const hentInnloggetAnsattMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (process.env.NAIS_CLUSTER_NAME === "lokal") {
        res.send(lokalMockBruker);
    } else {
        const bearerToken = getBearerToken(req);
        if (!bearerToken) {
            return next(new Error("Mangler token i auth header"));
        }
        const jwtPayload = decodeJwt(bearerToken);
        if (!jwtPayload) {
            return next(new Error("Kunne ikke decode token i auth header"));
        }
        return res.send(hentBrukerinfoFraToken(jwtPayload));
    }
};

export function getBearerToken(req: Request) {
    return req.headers?.authorization?.substring("Bearer ".length);
}