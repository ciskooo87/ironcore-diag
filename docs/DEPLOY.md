# Deploy — ironcore-diag

## Padrão de produção
- app dir: `/home/openclaw/.openclaw/workspace/ironcore-diag`
- service: `ironcore-diag.service`
- bind local: `127.0.0.1:3011`
- nginx: `diag.ironcore.lat`
- borda: Cloudflare

## 1. Preparar env
```bash
sudo cp deploy/ironcore-diag.env.example /etc/ironcore-diag.env
sudo nano /etc/ironcore-diag.env
```

## 2. Preparar banco
```bash
cd /home/openclaw/.openclaw/workspace/ironcore-diag
export $(grep -v '^#' .env | xargs) || true
npm run migrate
npm run seed:users
```

## 3. Instalar service
```bash
sudo cp deploy/ironcore-diag.service /etc/systemd/system/ironcore-diag.service
sudo systemctl daemon-reload
sudo systemctl enable ironcore-diag.service
```

## 4. Instalar nginx
```bash
sudo cp deploy/nginx.ironcore-diag.conf /etc/nginx/sites-available/diag.ironcore.lat
sudo ln -s /etc/nginx/sites-available/diag.ironcore.lat /etc/nginx/sites-enabled/diag.ironcore.lat
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Deploy oficial
```bash
cd /home/openclaw/.openclaw/workspace/ironcore-diag
bash ./scripts/deploy-prod.sh
```

## 6. Smoke tests
```bash
curl -I http://127.0.0.1:3011
curl -I http://127.0.0.1:3011/diag/
curl -I -H 'Host: ironcore.lat' http://127.0.0.1/diag/
curl -I -L https://ironcore.lat/diag/
```

## 7. Ordem de diagnóstico para 502
```bash
systemctl status ironcore-diag.service --no-pager
journalctl -u ironcore-diag.service -n 100 --no-pager
curl -I http://127.0.0.1:3011
curl -I -H 'Host: diag.ironcore.lat' http://127.0.0.1/
```
/.openclaw/workspace/ironcore-diag
bash ./scripts/deploy-prod.sh
```

## 6. Smoke tests
```bash
curl -I http://127.0.0.1:3011
curl -I -H 'Host: diag.ironcore.lat' http://127.0.0.1/
curl -I -L https://diag.ironcore.lat
```

## 7. Ordem de diagnóstico para 502
```bash
systemctl status ironcore-diag.service --no-pager
journalctl -u ironcore-diag.service -n 100 --no-pager
curl -I http://127.0.0.1:3011
curl -I -H 'Host: diag.ironcore.lat' http://127.0.0.1/
```
