#!/bin/bash
# Chay 1 lan duy nhat ngay sau khi SSH vao VPS moi (Ubuntu 22.04)
set -e

echo ">>> Cap nhat he dieu hanh..."
sudo apt update && sudo apt -y upgrade

echo ">>> Cai Docker, ufw, rclone..."
sudo apt install -y docker.io docker-compose-plugin git ufw rclone certbot

echo ">>> Cau hinh tuong lua..."
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo ">>> Kich hoat Docker..."
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

echo ">>> Tao cau truc thu muc du an..."
mkdir -p ~/decamath/{data/postgres,data/storage,backups,admin-dist,web-dist,certs,scripts}

echo ">>> Xong. Chay 'newgrp docker' hoac dang xuat/dang nhap lai de ap dung quyen docker."
echo ">>> Buoc tiep theo: copy .env, docker-compose.yml, nginx.conf vao ~/decamath/"
