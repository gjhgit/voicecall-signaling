# Coturn TURN Server Dockerfile
FROM coturn/coturn:latest

# 复制配置文件
COPY turnserver.conf /etc/coturn/turnserver.conf

# 暴露端口
EXPOSE 3478 3479 49160-49200

# 启动命令
CMD ["turnserver", "-c", "/etc/coturn/turnserver.conf", "--daemon"]
