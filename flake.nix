{
  description = "A Nix-flake based Kotlin development environment";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs";
  };

  outputs = {self, ...} @ inputs:
    inputs.flake-utils.lib.eachDefaultSystem (system: let
      inherit (inputs.nixpkgs) lib;
      pkgs = import inputs.nixpkgs {
        localSystem = {inherit system;};

        config.allowUnfreePredicate = pkg:
          builtins.elem (lib.getName pkg) [
            "idea-ultimate"
          ];

        overlays = [
          (final: prev: let
            javaVersion = 17;
          in {
            # JVM related overlays
            jdk = pkgs."jdk${builtins.toString javaVersion}";
            gradle = prev.gradle.override {
              java = pkgs.jdk;
            };
            kotlin = prev.kotlin.override {
              jre = pkgs.jdk;
            };
          })
        ];
      };
    in {
      checks = {
        # inherit # Comment in when you want tests to run on every new shell
        #   cargo-package
        #   ;
      };
      devShells.default = pkgs.mkShell {
        packages = with pkgs; [
          # project's code specific
          ## Backend
          gradle
          ## Frontend
          yarn
          python39
          nodejs_20

          # Editor stuffs
          helix
          kotlin-language-server
          jetbrains.idea-ultimate

          # Other tooling
          docker-compose
        ];

        shellHook = ''
          ${pkgs.helix}/bin/hx --version
          ${pkgs.helix}/bin/hx --health kotlin
          ${pkgs.gradle}/bin/gradle --version
        '';
      };
      packages = {
        # docker = pkgs.dockerTools.buildImage {
        #   name = pname;
        #   tag = "v${cargo-details.package.version}";
        #   extraCommands = ''mkdir -p data'';
        #   config = {
        #     Cmd = "--help";
        #     Entrypoint = ["${cargo-package}/bin/${pname}"];
        #   };
        # };
      };
      # packages.default = cargo-package;

      # Now `nix fmt` works!
      formatter = pkgs.alejandra;
    });
}
