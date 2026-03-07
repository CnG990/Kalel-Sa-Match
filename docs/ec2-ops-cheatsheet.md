# EC2 Ops Cheatsheet

## Project paths
- SSH/SSM working dir: `/home/ssm-user/projects/ksm`
- Backend repo: `/home/ssm-user/projects/ksm` (same as above)
- Gunicorn service name: `ksm_gunicorn.service`

## Routine commands
```bash
# Update code
cd /home/ssm-user/projects/ksm
git pull origin master

# Restart backend (gunicorn via systemd)
sudo systemctl restart ksm_gunicorn.service
sudo systemctl status ksm_gunicorn.service

# Tail logs
journalctl -u ksm_gunicorn.service -f

# Quick API smoke test
curl -s https://kalelsamatch.duckdns.org/api/terrains/terrains/all/ | head -c 200
```

Add any other useful commands/paths here as needed.
