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
      exp_backoff_restart_delay: 100,
      // ป้องกัน Crash Loop: ต้องรันอยู่ครบ min_uptime ถึงจะนับเป็น "รอดแล้ว" ไม่งั้นนับเป็น Restart ล้มเหลว
      // เข้า max_restarts — ถ้าครบ 10 ครั้งติดกันเร็วๆ PM2 จะหยุดพยายามเอง (status: errored) แทนที่จะวน Restart
      // รัวๆ ไม่เลิกจนกิน CPU/Log เต็มเครื่อง
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 5000
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
      exp_backoff_restart_delay: 100,
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 5000
    }
  ]
};
