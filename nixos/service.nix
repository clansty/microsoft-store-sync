{ pkgs, lib, config, ... }:

let
  cfg = config.services.microsoft-store-sync;
  configFile = pkgs.writeTextFile {
    name = "config.yml";
    text = pkgs.lib.generators.toYAML { } cfg.config;
  };
in
{
  config = lib.mkIf cfg.enable {
    users = {
      users.microsoft-store-sync = {
        isSystemUser = true;
        createHome = true;
        home = "/var/lib/microsoft-store-sync";
        group = "microsoft-store-sync";
        description = "microsoft-store-sync service";
      };

      groups.microsoft-store-sync = { };
    };

    systemd.services.microsoft-store-sync = {
      description = "Microsoft Store Sync";
      path = [ cfg.package ];
      wantedBy = [ "multi-user.target" ];
      after = [ "network-online.target" ];
      environment = {
        CONFIG = configFile;
      };
      serviceConfig = {
        User = "microsoft-store-sync";
        Group = "microsoft-store-sync";
        Restart = "on-failure";
        ExecStart = "${cfg.package}/bin/microsoft-store-sync --experimental-fetch";
        WorkingDirectory = "${cfg.package}/libexec/microsoft-store-sync";
      };
    };
  };
}
