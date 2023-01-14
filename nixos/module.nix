{ self }:
{ pkgs, config, ... }:

with pkgs.lib;
{
  imports = [
    ./service.nix
  ];
  options.services.microsoft-store-sync = {
    enable = mkEnableOption "Enables Microsoft Store Sync service";
    package = mkOption {
      type = types.package;
      default = self.packages.${pkgs.system}.default;
    };
    config = {
      packages = mkOption {
        type = types.listOf (types.attrsOf types.str);
      };
      basedir = mkOption {
        type = types.str;
      };
      aria2 = {
        host = mkOption {
          type = types.str;
        };
        port = mkOption {
          type = types.port;
        };
        auth.secret = mkOption {
          type = types.str;
        };
      };
    };
  };
}
