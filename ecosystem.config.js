module.exports = {
  apps: [
    {
      name: "projectdevhub-web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3002",
      cwd: "D:\\ProgramCHR\\9. ProjectDevHub\\frontend",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: "3002"
      },
      autorestart: true,
      max_memory_restart: "1G",
      exp_backoff_restart_delay: 100
    },
    {
      name: "projectdevhub-api",
      script: "D:\\ProgramCHR\\9. ProjectDevHub\\backend\\publish\\backend.exe",
      cwd: "D:\\ProgramCHR\\9. ProjectDevHub\\backend\\publish",
      env: {
        ASPNETCORE_URLS: "http://0.0.0.0:5003"
      },
      autorestart: true,
      max_memory_restart: "1G",
      exp_backoff_restart_delay: 100
    }
  ]
};
