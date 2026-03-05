#!/bin/bash

# Script d'analyse de la configuration Nginx existante
echo "🔍 Analyse de la configuration Nginx existante"
echo "=================================================="

# 1. Vérifier si Nginx est installé
echo "📦 Installation Nginx:"
if command -v nginx &> /dev/null; then
    nginx_version=$(nginx -v 2>&1 | head -1)
    echo "✅ Nginx installé: $nginx_version"
else
    echo "❌ Nginx non installé"
    echo "📦 Installation de Nginx..."
    sudo yum install -y nginx
fi
echo ""

# 2. Vérifier le statut du service
echo "🔄 Statut du service Nginx:"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx est en cours d'exécution"
else
    echo "❌ Nginx n'est pas en cours d'exécution"
    echo "🚀 Démarrage de Nginx..."
    sudo systemctl start nginx
fi

if systemctl is-enabled --quiet nginx; then
    echo "✅ Nginx est activé au démarrage"
else
    echo "❌ Nginx n'est pas activé au démarrage"
    echo "🔧 Activation au démarrage..."
    sudo systemctl enable nginx
fi
echo ""

# 3. Analyser les fichiers de configuration
echo "📂 Fichiers de configuration Nginx:"
echo "   - /etc/nginx/nginx.conf"
echo "   - /etc/nginx/conf.d/"
echo "   - /etc/nginx/sites-available/"
echo "   - /etc/nginx/sites-enabled/"
echo ""

# 4. Vérifier les sites disponibles
echo "🌐 Sites disponibles:"
if [ -d "/etc/nginx/sites-available" ]; then
    ls -la /etc/nginx/sites-available/
else
    echo "❌ Répertoire sites-available non trouvé"
fi
echo ""

# 5. Vérifier les sites activés
echo "🔗 Sites activés:"
if [ -d "/etc/nginx/sites-enabled" ]; then
    ls -la /etc/nginx/sites-enabled/
else
    echo "❌ Répertoire sites-enabled non trouvé"
fi
echo ""

# 6. Vérifier la configuration principale
echo "⚙️  Configuration principale:"
if [ -f "/etc/nginx/nginx.conf" ]; then
    echo "✅ nginx.conf trouvé"
    echo "📋 Contenu principal:"
    grep -E "(server_name|listen|root)" /etc/nginx/nginx.conf | head -10
else
    echo "❌ nginx.conf non trouvé"
fi
echo ""

# 7. Vérifier les ports écoutés
echo "🔌 Ports écoutés:"
sudo netstat -tlnp | grep nginx
echo ""

# 8. Tester la configuration Nginx
echo "🧪 Test de configuration Nginx:"
sudo nginx -t
echo ""

# 9. Vérifier les logs
echo "📋 Logs Nginx:"
echo "   - Access log: /var/log/nginx/access.log"
echo "   - Error log: /var/log/nginx/error.log"
echo "   - Journal: sudo journalctl -u nginx -f"
echo ""

# 10. Vérifier le firewall
echo "🔥 Configuration firewall:"
if command -v firewall-cmd &> /dev/null; then
    echo "✅ firewalld disponible"
    echo "📋 Ports ouverts:"
    sudo firewall-cmd --list-ports
    echo "📋 Services autorisés:"
    sudo firewall-cmd --list-services
else
    echo "❌ firewalld non disponible"
fi
echo ""

# 11. Vérifier SSL/TLS
echo "🔒 Configuration SSL/TLS:"
if [ -d "/etc/letsencrypt" ]; then
    echo "✅ Let's Encrypt trouvé"
    echo "📋 Certificats disponibles:"
    sudo find /etc/letsencrypt -name "*.pem" | head -5
else
    echo "❌ Let's Encrypt non trouvé"
fi
echo ""

# 12. Vérifier les performances
echo "⚡ Configuration performances:"
if [ -f "/etc/nginx/nginx.conf" ]; then
    worker_processes=$(grep "worker_processes" /etc/nginx/nginx.conf | awk '{print $2}')
    worker_connections=$(grep "worker_connections" /etc/nginx/nginx.conf | awk '{print $2}')
    echo "   - Worker processes: ${worker_processes:-auto}"
    echo "   - Worker connections: ${worker_connections:-1024}"
fi
echo ""

# 13. Résumé et recommandations
echo "📊 Résumé de l'analyse:"
echo "=================================================="

# Vérifier si le domaine kalelsamatch.duckdns.org est configuré
if grep -q "kalelsamatch.duckdns.org" /etc/nginx/nginx.conf 2>/dev/null; then
    echo "✅ Domaine kalelsamatch.duckdns.org trouvé dans la configuration"
else
    echo "❌ Domaine kalelsamatch.duckdns.org non trouvé"
fi

# Vérifier si le port 80 et 443 sont configurés
if sudo netstat -tlnp | grep nginx | grep -E ":80|:443" > /dev/null; then
    echo "✅ Ports 80/443 configurés pour Nginx"
else
    echo "❌ Ports 80/443 non configurés pour Nginx"
fi

# Vérifier si le reverse proxy vers gunicorn est configuré
if grep -q "127.0.0.1:8000" /etc/nginx/nginx.conf 2>/dev/null; then
    echo "✅ Reverse proxy vers gunicorn trouvé"
else
    echo "❌ Reverse proxy vers gunicorn non trouvé"
fi

echo ""
echo "🎯 Recommandations:"
echo "   1. Si le domaine n'est pas configuré, copier nginx.conf fourni"
echo "   2. Si les ports ne sont pas ouverts, configurer le firewall"
echo "   3. Si le reverse proxy n'est pas configuré, l'ajouter"
echo "   4. Redémarrer Nginx après modifications: sudo systemctl restart nginx"
