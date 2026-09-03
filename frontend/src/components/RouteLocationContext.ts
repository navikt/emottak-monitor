import { createContext, useContext } from "react";
import { Location } from "react-router-dom";

/**
 * Kontekst som holder "bakgrunnslokasjonen" ved åpning av modaler, slik som "/logg/..." fra LoggTable.tsx.
 * Dette sørger for at korrekt tittel blir vist på siden som vises i bakgrunnen av modalen,
 * som kan være f.eks. "Meldinger" (MessagesTable.tsx) eller "Hendelser" (EventsTable.tsx).
 */
export const RouteLocationContext = createContext<Location | null>(null);

export const useRouteLocation = (): Location => {
  const context = useContext(RouteLocationContext);
  if (context === null) {
    throw new Error("useRouteLocation must be used within a RouteLocationContext.Provider");
  }
  return context;
};
