/**
 * CommonJS wrapper for child support calculator
 * This allows the API server to use require() to load the ES module
 */

const path = require('path');

// Dynamic import for ES modules
let childSupportModule = null;
let loadPromise = null;

async function loadModule() {
  if (childSupportModule) return childSupportModule;
  if (loadPromise) return loadPromise;
  
  const modulePath = path.join(__dirname, 'dist', 'nodeTableLoader.js');
  
  loadPromise = import(modulePath).then(module => {
    childSupportModule = module;
    return module;
  });
  
  return loadPromise;
}

// Export sync wrapper functions
exports.loadChildSupportTables = async function(dataDir) {
  const module = await loadModule();
  return module.loadChildSupportTables(dataDir);
};

exports.lookupChildSupport = async function(tables, year, income, numChildren) {
  const module = await loadModule();
  return module.lookupChildSupport(tables, year, income, numChildren);
};

exports.getAvailableYears = async function(tables) {
  const module = await loadModule();
  return module.getAvailableYears(tables);
};
