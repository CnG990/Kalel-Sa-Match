const fs = require('fs');
const path = require('path');

// Files to fix with their specific issues
const fixes = [
  {
    file: 'src/components/AdvancedMapNavigation.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['MapPin', 'AlertTriangle', 'Phone'] },
      { type: 'remove_unused_variables', variables: ['navigationRoute', 'marker', 'encodedPolyline', 'heading', 'speed', 'terrainId', 'setReservationUpdates'] }
    ]
  },
  {
    file: 'src/components/CSVTerrainImport.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['CheckCircle', 'AlertTriangle'] }
    ]
  },
  {
    file: 'src/components/DiagnosticDebug.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['User', 'BarChart3'] }
    ]
  },
  {
    file: 'src/components/RefundModal.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['Calendar', 'Clock'] },
      { type: 'remove_unused_variables', variables: ['formatDate'] }
    ]
  },
  {
    file: 'src/components/SubscriptionSessionsManager.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['AlertTriangle', 'Filter', 'Eye', 'Edit'] },
      { type: 'remove_unused_variables', variables: ['dateDebut'] }
    ]
  },
  {
    file: 'src/components/TerrainImagesManager.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['Camera', 'Eye'] },
      { type: 'remove_unused_variables', variables: ['terrainId', 'moveImage'] }
    ]
  },
  {
    file: 'src/components/TerrainLayout.tsx',
    changes: [
      { type: 'remove_unused_variables', variables: ['user'] }
    ]
  },
  {
    file: 'src/components/TerrainManagerAssignment.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['AlertCircle'] }
    ]
  },
  {
    file: 'src/hooks/useRealtimeSync.ts',
    changes: [
      { type: 'remove_unused_imports', imports: ['apiService', 'toast'] },
      { type: 'remove_unused_variables', variables: ['setReservationUpdates'] }
    ]
  },
  {
    file: 'src/pages/AbonnementsPage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['Calendar', 'Clock', 'Users', 'Star'] },
      { type: 'remove_unused_variables', variables: ['user'] }
    ]
  },
  {
    file: 'src/pages/admin/LogsPage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['toast'] }
    ]
  },
  {
    file: 'src/pages/admin/ManagerValidationPage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['FileText', 'Plus', 'Edit'] },
      { type: 'remove_unused_variables', variables: ['onReject'] }
    ]
  },
  {
    file: 'src/pages/admin/ManageTerrainsPage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['Download', 'Building', 'DollarSign', 'Star', 'ToggleLeft', 'ToggleRight', 'CheckCircle', 'XCircle', 'AlertTriangle'] },
      { type: 'remove_unused_variables', variables: ['uploadProgress', 'showAddForm', 'setShowAddForm', 'showUploadModal', 'setShowUploadModal', 'search', 'setSearch', 'statusFilter', 'setStatusFilter', 'handleExportGeoData'] }
    ]
  },
  {
    file: 'src/pages/admin/NotificationsPage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['Filter', 'MessageSquare', 'Calendar'] }
    ]
  },
  {
    file: 'src/pages/admin/PaymentsPage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['Filter', 'Calendar', 'TrendingDown'] }
    ]
  },
  {
    file: 'src/pages/admin/ReportsPage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['BarChart3'] }
    ]
  },
  {
    file: 'src/pages/admin/ReservationsPage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['MapPin', 'User', 'Edit', 'FileText'] },
      { type: 'remove_unused_variables', variables: ['showDetailsModal', 'handleStatusChange'] }
    ]
  },
  {
    file: 'src/pages/admin/SettingsPage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['Settings'] }
    ]
  },
  {
    file: 'src/pages/admin/SubscriptionsPage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['Filter', 'Calendar'] }
    ]
  },
  {
    file: 'src/pages/components/ReservationModal.tsx',
    changes: [
      { type: 'remove_unused_variables', variables: ['showSubscriptionOptions', 'setShowSubscriptionOptions'] }
    ]
  },
  {
    file: 'src/pages/dashboard/MapPage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['Home'] },
      { type: 'remove_unused_variables', variables: ['showLegend', 'setShowLegend', 'sortByDistance'] }
    ]
  },
  {
    file: 'src/pages/dashboard/MapPageOptimized.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['Navigation', 'Route', 'Layers', 'Calendar', 'Clock', 'Star', 'User', 'Heart'] },
      { type: 'remove_unused_variables', variables: ['BASE_URL', 'currentLayer', 'setCurrentLayer', 'showLayerSelector', 'setShowLayerSelector', 'user', 'imagePath', 'mapLayers', 'gestionnaire'] }
    ]
  },
  {
    file: 'src/pages/dashboard/SettingsPage.tsx',
    changes: [
      { type: 'remove_unused_variables', variables: ['user', 'loading'] }
    ]
  },
  {
    file: 'src/pages/manager/ManagerDashboard.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['Building'] },
      { type: 'remove_unused_variables', variables: ['StatCard', 'user', 'statCards'] }
    ]
  },
  {
    file: 'src/pages/manager/ManagerLayout.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['BarChart3', 'MapPin', 'Bell', 'Search'] }
    ]
  },
  {
    file: 'src/pages/manager/ProfilePage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['Upload'] },
      { type: 'remove_unused_variables', variables: ['user'] }
    ]
  },
  {
    file: 'src/pages/manager/PromotionsPage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['Gift', 'Percent', 'Calendar', 'Clock', 'Users', 'Star', 'CheckCircle', 'XCircle', 'AlertTriangle', 'Target'] },
      { type: 'remove_unused_variables', variables: ['toast', 'format', 'fr', 'user'] }
    ]
  },
  {
    file: 'src/pages/manager/RevenuePage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['BarChart3', 'Loader2'] },
      { type: 'remove_unused_variables', variables: ['setError'] }
    ]
  },
  {
    file: 'src/pages/manager/TerrainsPage.tsx',
    changes: [
      { type: 'remove_unused_variables', variables: ['user'] }
    ]
  },
  {
    file: 'src/pages/ReservationPage.tsx',
    changes: [
      { type: 'remove_unused_variables', variables: ['id'] }
    ]
  },
  {
    file: 'src/pages/TerrainDetailPage.tsx',
    changes: [
      { type: 'remove_unused_variables', variables: ['mainImage', 'isTerrainAvailable'] }
    ]
  },
  {
    file: 'src/pages/TerrainInfoPage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['Calendar'] },
      { type: 'remove_unused_variables', variables: ['showAbonnements', 'setShowAbonnements'] }
    ]
  },
  {
    file: 'src/pages/TerrainsPage.tsx',
    changes: [
      { type: 'remove_unused_variables', variables: ['TerrainsResponse', 'terrain'] }
    ]
  },
  {
    file: 'src/pages/TerrainsReservationPage.tsx',
    changes: [
      { type: 'remove_unused_imports', imports: ['Clock'] },
      { type: 'remove_unused_variables', variables: ['terrain'] }
    ]
  },
  {
    file: 'src/utils/analytics.ts',
    changes: [
      { type: 'remove_unused_variables', variables: ['loadFromLocalStorage'] }
    ]
  }
];

console.log('Starting TypeScript error fixes...');

fixes.forEach(fix => {
  const filePath = path.join(__dirname, fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${fix.file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  fix.changes.forEach(change => {
    if (change.type === 'remove_unused_imports') {
      change.imports.forEach(importName => {
        // Remove from import statements
        const importRegex = new RegExp(`\\b${importName}\\b\\s*,?\\s*`, 'g');
        content = content.replace(importRegex, '');
        
        // Clean up empty import lines
        content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];?\s*\n/g, '');
        content = content.replace(/import\s*{\s*,\s*}\s*from\s*['"][^'"]+['"];?\s*\n/g, '');
      });
    }
    
    if (change.type === 'remove_unused_variables') {
      change.variables.forEach(variableName => {
        // Remove variable declarations
        const varRegex = new RegExp(`\\bconst\\s+${variableName}\\s*=\\s*[^;]+;?\\s*\n?`, 'g');
        content = content.replace(varRegex, '');
        
        // Remove destructured variables
        const destructureRegex = new RegExp(`\\b${variableName}\\b\\s*,?\\s*`, 'g');
        content = content.replace(destructureRegex, '');
      });
    }
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed: ${fix.file}`);
});

console.log('TypeScript error fixes completed!'); 