import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Globe, Shield, Database, Users, Barcode, Zap, CheckCircle, XCircle, Clock, AlertTriangle, Download, ShoppingCart, Building2, RefreshCw, History, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DomainCheckResult } from './DomainChecker';
import { Language } from '../../types';
import { getTranslation } from '../../utils/translations';

interface DomainResultsProps {
  results: DomainCheckResult[];
  language: Language;
  isChecking?: boolean;
  onForceUpdate?: (domain: string) => void;
}

export const DomainResults: React.FC<DomainResultsProps> = ({ results, language, isChecking = false, onForceUpdate }) => {
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());

  const toggleDomain = (domain: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domain)) {
      newExpanded.delete(domain);
    } else {
      newExpanded.add(domain);
    }
    setExpandedDomains(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportResults = () => {
    const csvContent = [
      [getTranslation(language, 'domain'), getTranslation(language, 'status'), getTranslation(language, 'botBlockers'), 'Crawl 360', 'Crawl WIT', 'Crawl Surf', getTranslation(language, 'clients'), getTranslation(language, 'domainProfile'), getTranslation(language, 'ecommercePlatform'), 'EAN', 'GTIN', 'UPC', 'MPN', 'EAN Responsive'].join(','),
      ...results.map(result => [
        result.domain,
        result.status,
        result.checks.botBlockers.blockers.map(b => typeof b === 'object' ? b.name : b).join(';'),
        result.checks.crawlStatus.on360 ? 'Oui' : 'Non',
        result.checks.crawlStatus.onWIT ? 'Oui' : 'Non',
        result.checks.crawlStatus.onSurf ? 'Oui' : 'Non',
        result.checks.clientUsage.count,
        result.checks.domainProfile.type || 'Unknown',
        result.checks.ecommercePlatform.platform || 'None',
        result.checks.productIdentifiers.ean ? 'Yes' : 'No',
        result.checks.productIdentifiers.gtin ? 'Yes' : 'No',
        result.checks.productIdentifiers.upc ? 'Yes' : 'No',
        result.checks.productIdentifiers.mpn ? 'Yes' : 'No',
        result.checks.eanResponsive.responsive ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `domain-check-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    // Créer un élément temporaire avec le contenu à convertir en PDF
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '210mm'; // Format A4
    tempDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    tempDiv.style.fontSize = '12px';
    tempDiv.style.lineHeight = '1.4';
    tempDiv.style.color = '#1f2937';
    tempDiv.style.background = 'white';
    tempDiv.style.padding = '20px';

    // Générer le contenu HTML
    tempDiv.innerHTML = `
      <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #3b82f6;">
        <h1 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px; font-weight: 700;">
          🌐 Domain Check Results
        </h1>
        <div style="color: #6b7280; font-size: 12px; display: flex; gap: 20px; flex-wrap: wrap;">
          <span>📅 Generated: ${new Date().toLocaleString()}</span>
          <span>📊 Total domains: ${results.length}</span>
          <span>✅ Completed: ${results.filter(r => r.status === 'completed').length}</span>
          <span>❌ Errors: ${results.filter(r => r.status === 'error').length}</span>
        </div>
      </div>
      
      ${results.map(result => `
        <div style="margin-bottom: 30px; page-break-inside: avoid;">
          <div style="background: #f8fafc; padding: 15px 20px; border-radius: 8px 8px 0 0; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <span style="font-size: 18px;">🌐</span>
            <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">${result.domain}</h2>
            <span style="padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; ${
              result.status === 'completed' ? 'background: #dcfce7; color: #166534;' : 'background: #fecaca; color: #dc2626;'
            }">${result.status}</span>
            ${result.startTime && result.endTime ? 
              `<span style="padding: 4px 8px; background: #f3f4f6; color: #6b7280; border-radius: 6px; font-size: 11px;">${Math.round((result.endTime.getTime() - result.startTime.getTime()) / 1000)}s</span>` : 
              ''
            }
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; padding: 20px; background: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            ${result.checks.botBlockers.status === 'completed' ? `
              <div style="background: #fafafa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-weight: 600; color: #374151;">
                  <span>🛡️</span>
                  <span>Bot Blockers</span>
                </div>
                <div style="font-size: 11px;">
                  <span style="padding: 4px 8px; border-radius: 6px; font-weight: 500; margin-bottom: 8px; display: inline-block; ${
                    result.checks.botBlockers.overallSeverity === 'high' ? 'background: #fecaca; color: #dc2626;' :
                    result.checks.botBlockers.overallSeverity === 'medium' ? 'background: #fef3c7; color: #d97706;' :
                    'background: #dcfce7; color: #166534;'
                  }">Severity: ${result.checks.botBlockers.overallSeverity}</span>
                  ${result.checks.botBlockers.blockers.length > 0 ? 
                    result.checks.botBlockers.blockers.map(blocker => `<div style="margin: 4px 0; padding-left: 12px; position: relative;"><span style="position: absolute; left: 0;">•</span>${typeof blocker === 'object' ? blocker.name : blocker}</div>`).join('') : 
                    '<div style="color: #10b981; font-weight: 500;">No bot blockers detected</div>'
                  }
                </div>
              </div>
            ` : ''}
            
            ${result.checks.crawlStatus.status === 'completed' ? `
              <div style="background: #fafafa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-weight: 600; color: #374151;">
                  <span>🗄️</span>
                  <span>Crawl Status</span>
                </div>
                <div style="font-size: 11px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${result.checks.crawlStatus.on360 ? '#10b981' : '#ef4444'};"></span>
                      <span>360: ${result.checks.crawlStatus.on360 ? 'Crawled' : 'Not crawled'}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${result.checks.crawlStatus.onWIT ? '#10b981' : '#ef4444'};"></span>
                      <span>WIT: ${result.checks.crawlStatus.onWIT ? 'Crawled' : 'Not crawled'}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${result.checks.crawlStatus.onSurf ? '#10b981' : '#ef4444'};"></span>
                      <span>Surf: ${result.checks.crawlStatus.onSurf ? 'Crawled' : 'Not crawled'}</span>
                    </div>
                  </div>
                  ${result.checks.crawlStatus.lastCrawl ? 
                    `<div style="margin-top: 8px; color: #6b7280;">Last crawl: ${new Date(result.checks.crawlStatus.lastCrawl).toLocaleDateString()}</div>` : 
                    ''
                  }
                </div>
              </div>
            ` : ''}
            
            ${result.checks.clientUsage.status === 'completed' ? `
              <div style="background: #fafafa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-weight: 600; color: #374151;">
                  <span>👥</span>
                  <span>Client Usage</span>
                </div>
                <div style="font-size: 11px;">
                  <div style="font-size: 16px; font-weight: 600; color: #2563eb; margin-bottom: 8px;">
                    ${result.checks.clientUsage.count} client(s)
                  </div>
                  ${result.checks.clientUsage.clients.slice(0, 5).map(client => `<div style="margin: 4px 0; padding-left: 12px; position: relative;"><span style="position: absolute; left: 0;">•</span>${client}</div>`).join('')}
                  ${result.checks.clientUsage.clients.length > 5 ? 
                    `<div style="color: #6b7280; margin-top: 4px;">+${result.checks.clientUsage.clients.length - 5} more...</div>` : 
                    ''
                  }
                </div>
              </div>
            ` : ''}
            
            ${result.checks.domainProfile.status === 'completed' && result.checks.domainProfile.type ? `
              <div style="background: #fafafa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-weight: 600; color: #374151;">
                  <span>🏢</span>
                  <span>Domain Profile</span>
                </div>
                <div style="font-size: 11px;">
                  <span style="padding: 4px 8px; border-radius: 6px; font-weight: 500; margin: 2px 4px 2px 0; display: inline-block; ${
                    result.checks.domainProfile.type === 'brand' ? 'background: #dbeafe; color: #2563eb;' :
                    result.checks.domainProfile.type === 'marketplace' ? 'background: #fef3c7; color: #d97706;' :
                    'background: #dcfce7; color: #166534;'
                  }">${
                    result.checks.domainProfile.type === 'brand' ? 'Brand Site' :
                    result.checks.domainProfile.type === 'marketplace' ? 'Marketplace' :
                    'E-commerce Site'
                  }</span>
                  ${result.checks.domainProfile.brandName ? `<span style="padding: 4px 8px; background: #f3f4f6; color: #6b7280; border-radius: 6px; font-size: 10px; margin: 2px 4px 2px 0; display: inline-block;">${result.checks.domainProfile.brandName}</span>` : ''}
                  <div style="margin-top: 8px;">
                    <div style="color: #6b7280; margin-bottom: 4px;">Confidence: ${result.checks.domainProfile.confidence}%</div>
                    <div style="background: #e5e7eb; border-radius: 4px; height: 6px; overflow: hidden;">
                      <div style="height: 100%; background: linear-gradient(90deg, #3b82f6, #1d4ed8); width: ${result.checks.domainProfile.confidence}%;"></div>
                    </div>
                  </div>
                  ${result.checks.domainProfile.indicators.slice(0, 3).map(indicator => `<div style="margin: 4px 0; padding-left: 12px; position: relative;"><span style="position: absolute; left: 0;">•</span>${indicator}</div>`).join('')}
                </div>
              </div>
            ` : ''}
            
            ${result.checks.ecommercePlatform.status === 'completed' && result.checks.ecommercePlatform.platform ? `
              <div style="background: #fafafa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-weight: 600; color: #374151;">
                  <span>🛒</span>
                  <span>E-commerce Platform</span>
                </div>
                <div style="font-size: 11px;">
                  <span style="padding: 4px 8px; background: #e9d5ff; color: #7c3aed; border-radius: 6px; font-weight: 500; margin: 2px 4px 2px 0; display: inline-block;">${result.checks.ecommercePlatform.platform}</span>
                </div>
              </div>
            ` : ''}
            
            ${result.checks.productIdentifiers.status === 'completed' ? `
              <div style="background: #fafafa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-weight: 600; color: #374151;">
                  <span>🏷️</span>
                  <span>Product Identifiers</span>
                </div>
                <div style="font-size: 11px;">
                  <div style="font-weight: 600; margin-bottom: 8px;">Coverage: ${result.checks.productIdentifiers.coverage}%</div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${result.checks.productIdentifiers.ean ? '#10b981' : '#ef4444'};"></span>
                      <span>EAN</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${result.checks.productIdentifiers.gtin ? '#10b981' : '#ef4444'};"></span>
                      <span>GTIN</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${result.checks.productIdentifiers.upc ? '#10b981' : '#ef4444'};"></span>
                      <span>UPC</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${result.checks.productIdentifiers.mpn ? '#10b981' : '#ef4444'};"></span>
                      <span>MPN</span>
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}
            
            ${result.checks.eanResponsive.status === 'completed' ? `
              <div style="background: #fafafa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; grid-column: 1 / -1;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-weight: 600; color: #374151;">
                  <span>⚡</span>
                  <span>EAN Responsive Test</span>
                </div>
                <div style="font-size: 11px;">
                  <span style="padding: 4px 8px; border-radius: 6px; font-weight: 500; margin: 2px 4px 2px 0; display: inline-block; ${
                    result.checks.eanResponsive.responsive ? 'background: #dcfce7; color: #166534;' : 'background: #fecaca; color: #dc2626;'
                  }">${result.checks.eanResponsive.responsive ? 'EAN Responsive' : 'Non EAN Responsive'}</span>
                  <span style="padding: 4px 8px; border-radius: 6px; font-weight: 500; margin: 2px 4px 2px 0; display: inline-block; ${
                    result.checks.eanResponsive.searchFormFound ? 'background: #dbeafe; color: #2563eb;' : 'background: #f3f4f6; color: #6b7280;'
                  }">Form: ${result.checks.eanResponsive.searchFormFound ? 'Found' : 'Not found'}</span>
                  ${result.checks.eanResponsive.testResults.length > 0 ? 
                    result.checks.eanResponsive.testResults.map(testResult => `<div style="margin: 4px 0; padding-left: 12px; position: relative;"><span style="position: absolute; left: 0;">•</span>${testResult}</div>`).join('') : 
                    ''
                  }
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `).join('')}
    `;

    document.body.appendChild(tempDiv);

    // Utiliser html2canvas pour convertir en image puis jsPDF pour créer le PDF
    html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: tempDiv.scrollWidth,
      height: tempDiv.scrollHeight
    }).then(canvas => {
      // Supprimer l'élément temporaire
      document.body.removeChild(tempDiv);

      // Créer le PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculer les dimensions pour s'adapter à la page A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // Marges de 10mm de chaque côté
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10; // Marge du haut
      
      // Ajouter la première page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20; // Soustraire les marges
      
      // Ajouter des pages supplémentaires si nécessaire
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }
      
      // Télécharger le PDF
      pdf.save(`domain-check-results-${new Date().toISOString().split('T')[0]}.pdf`);
    }).catch(error => {
      console.error('Erreur lors de la génération du PDF:', error);
      document.body.removeChild(tempDiv);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    });
  };

  // Vérifier si toutes les vérifications sont terminées
  const allCompleted = results.length > 0 && results.every(result => 
    result.status === 'completed' || result.status === 'error'
  );
  
  const canExport = allCompleted && !isChecking;

  return (
    <div className="space-y-4">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {getTranslation(language, 'verificationResults')} ({results.length} {getTranslation(language, 'domains')})
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={exportResults}
            disabled={!canExport}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              canExport
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Download className="h-4 w-4" />
            {getTranslation(language, 'exportCSV')}
          </button>
          <button
            onClick={exportPDF}
            disabled={!canExport}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              canExport
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </button>
          {!canExport && (
            <span className="text-sm text-gray-500">
              {isChecking ? 'Vérification en cours...' : 'En attente des résultats'}
            </span>
          )}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.map((result) => (
          <div key={result.domain} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Domain Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleDomain(result.domain)}
            >
              <div className="flex items-center gap-4">
                {expandedDomains.has(result.domain) ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
                <Globe className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">{result.domain}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(result.status)}
                    <span className="text-sm text-gray-600">
                      {result.status === 'completed' ? getTranslation(language, 'completed') : 
                       result.status === 'checking' ? getTranslation(language, 'checking') : 
                       result.status === 'error' ? getTranslation(language, 'domainCheckStatusError') : getTranslation(language, 'pending')}
                    </span>
                    {result.fromCache && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium border border-blue-200">
                        Cache
                      </span>
                    )}
                    {result.lastChecked && (
                      <span className="text-xs text-gray-500">
                        ({new Date(result.lastChecked).toLocaleDateString(language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-ES')})
                      </span>
                    )}
                    {result.startTime && result.endTime && (
                      <span className="text-xs text-gray-500">
                        ({Math.round((result.endTime.getTime() - result.startTime.getTime()) / 1000)}s)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Status Indicators */}
              <div className="flex items-center gap-3">
                {/* Force Update Button */}
                {onForceUpdate && result.status === 'completed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onForceUpdate(result.domain);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-xs font-medium"
                    title="Force update analysis"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Update
                  </button>
                )}
                
                <div className="flex items-center gap-2">
                {result.checks.botBlockers.status === 'completed' && (
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getSeverityColor(result.checks.botBlockers.overallSeverity)}`}>
                    {result.checks.botBlockers.blockers.length} bot blocker(s)
                  </span>
                )}
                {result.checks.crawlStatus.status === 'completed' && (
                  <div className="flex gap-1">
                    {result.checks.crawlStatus.on360 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">360</span>
                    )}
                    {result.checks.crawlStatus.onWIT && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-medium">WIT</span>
                    )}
                    {result.checks.crawlStatus.onSurf && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium">Surf</span>
                    )}
                  </div>
                )}
                {result.checks.eanResponsive.status === 'completed' && (
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    result.checks.eanResponsive.responsive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    EAN {result.checks.eanResponsive.responsive ? '✓' : '✗'}
                  </span>
                )}
                {result.checks.ecommercePlatform.status === 'completed' && result.checks.ecommercePlatform.platform && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-medium">
                    {result.checks.ecommercePlatform.platform}
                  </span>
                )}
                {result.checks.domainProfile.status === 'completed' && result.checks.domainProfile.type && (
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    result.checks.domainProfile.type === 'brand' 
                      ? 'bg-blue-100 text-blue-800'
                      : result.checks.domainProfile.type === 'marketplace'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {result.checks.domainProfile.type === 'brand' 
                      ? getTranslation(language, 'brandSite')
                      : result.checks.domainProfile.type === 'marketplace'
                        ? getTranslation(language, 'marketplace')
                        : getTranslation(language, 'ecommerceSite')
                    }
                  </span>
                )}
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            {expandedDomains.has(result.domain) && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Bot Blockers */}
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="h-5 w-5 text-red-500" />
                      <h4 className="font-semibold text-gray-900">{getTranslation(language, 'botBlockers')}</h4>
                      {getStatusIcon(result.checks.botBlockers.status)}
                    </div>
                    {result.checks.botBlockers.status === 'completed' && (
                      <div className="space-y-2">
                        <div className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium border ${getSeverityColor(result.checks.botBlockers.overallSeverity)}`}>
                          {getTranslation(language, 'severity')}: {result.checks.botBlockers.overallSeverity}
                        </div>
                        {result.checks.botBlockers.blockers.length > 0 ? (
                          <div className="space-y-1">
                            {result.checks.botBlockers.blockers.map((blocker, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">• {blocker.name}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(blocker.severity)}`}>
                                  {blocker.severity}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-green-600">{getTranslation(language, 'noBotBlockersDetected')}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Crawl Status */}
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center gap-3 mb-3">
                      <Database className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold text-gray-900">{getTranslation(language, 'crawlStatus')}</h4>
                      {getStatusIcon(result.checks.crawlStatus.status)}
                    </div>
                    {result.checks.crawlStatus.status === 'completed' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${result.checks.crawlStatus.on360 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-sm">360: {result.checks.crawlStatus.on360 ? getTranslation(language, 'crawled') : getTranslation(language, 'notCrawled')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${result.checks.crawlStatus.onWIT ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-sm">WIT: {result.checks.crawlStatus.onWIT ? getTranslation(language, 'crawled') : getTranslation(language, 'notCrawled')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${result.checks.crawlStatus.onSurf ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-sm">Surf: {result.checks.crawlStatus.onSurf ? getTranslation(language, 'crawled') : getTranslation(language, 'notCrawled')}</span>
                        </div>
                        {result.checks.crawlStatus.lastCrawl && (
                          <div className="text-xs text-gray-500">
                            {getTranslation(language, 'lastCrawl')}: {new Date(result.checks.crawlStatus.lastCrawl).toLocaleDateString(language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-ES')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Client Usage */}
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold text-gray-900">{getTranslation(language, 'clientUsage')}</h4>
                      {getStatusIcon(result.checks.clientUsage.status)}
                    </div>
                    {result.checks.clientUsage.status === 'completed' && (
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-blue-600">
                          {result.checks.clientUsage.count} {getTranslation(language, 'clients')}
                        </div>
                        {result.checks.clientUsage.clients.length > 0 && (
                          <div className="space-y-1">
                            {result.checks.clientUsage.clients.slice(0, 3).map((client, i) => (
                              <div key={i} className="text-sm text-gray-600">• {client}</div>
                            ))}
                            {result.checks.clientUsage.clients.length > 3 && (
                              <div className="text-sm text-gray-500">
                                +{result.checks.clientUsage.clients.length - 3} more...
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="h-5 w-5 text-indigo-500" />
                      <h4 className="font-semibold text-gray-900">{getTranslation(language, 'domainProfile')}</h4>
                      {getStatusIcon(result.checks.domainProfile.status)}
                    </div>
                    {result.checks.domainProfile.status === 'completed' && (
                      <div className="space-y-3">
                        {result.checks.domainProfile.type ? (
                          <>
                            <div className="flex items-center gap-3">
                              <div className={`px-3 py-2 rounded-lg font-medium ${
                                result.checks.domainProfile.type === 'brand' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : result.checks.domainProfile.type === 'marketplace'
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-green-100 text-green-800'
                              }`}>
                                {result.checks.domainProfile.type === 'brand' 
                                  ? getTranslation(language, 'brandSite')
                                  : result.checks.domainProfile.type === 'marketplace'
                                    ? getTranslation(language, 'marketplace')
                                    : getTranslation(language, 'ecommerceSite')
                                }
                              </div>
                              {result.checks.domainProfile.brandName && (
                                <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                  {result.checks.domainProfile.brandName}
                                </div>
                              )}
                              {result.checks.domainProfile.marketplaceType && (
                                <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                  {result.checks.domainProfile.marketplaceType}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">{getTranslation(language, 'confidence')}:</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-indigo-500 h-2 rounded-full transition-all"
                                  style={{ width: `${result.checks.domainProfile.confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{result.checks.domainProfile.confidence}%</span>
                            </div>
                            {result.checks.domainProfile.indicators.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-700">{getTranslation(language, 'indicators')}:</div>
                                {result.checks.domainProfile.indicators.slice(0, 3).map((indicator, i) => (
                                  <div key={i} className="text-sm text-gray-600">• {indicator}</div>
                                ))}
                                {result.checks.domainProfile.indicators.length > 3 && (
                                  <div className="text-sm text-gray-500">
                                    +{result.checks.domainProfile.indicators.length - 3} more...
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-gray-600">{getTranslation(language, 'unknownProfile')}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* E-commerce Platform */}
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center gap-3 mb-3">
                      <ShoppingCart className="h-5 w-5 text-purple-500" />
                      <h4 className="font-semibold text-gray-900">{getTranslation(language, 'ecommercePlatform')}</h4>
                      {getStatusIcon(result.checks.ecommercePlatform.status)}
                    </div>
                    {result.checks.ecommercePlatform.status === 'completed' && (
                      <div className="space-y-3">
                        {result.checks.ecommercePlatform.platform ? (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium">
                                {result.checks.ecommercePlatform.platform}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-600">{getTranslation(language, 'noPlatformDetected')}</div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Product Identifiers */}
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center gap-3 mb-3">
                      <Barcode className="h-5 w-5 text-purple-500" />
                      <h4 className="font-semibold text-gray-900">{getTranslation(language, 'productIdentifiers')}</h4>
                      {getStatusIcon(result.checks.productIdentifiers.status)}
                    </div>
                    {result.checks.productIdentifiers.status === 'completed' && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">
                          {getTranslation(language, 'coverage')}: {result.checks.productIdentifiers.coverage}%
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'ean', label: 'EAN' },
                            { key: 'gtin', label: 'GTIN' },
                            { key: 'upc', label: 'UPC' },
                            { key: 'mpn', label: 'MPN' }
                          ].map(({ key, label }) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${
                                result.checks.productIdentifiers[key as keyof typeof result.checks.productIdentifiers] 
                                  ? 'bg-green-500' : 'bg-red-500'
                              }`}></span>
                              <span className="text-sm">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* EAN Responsive */}
                  <div className="bg-white rounded-lg p-4 border lg:col-span-2">
                    <div className="flex items-center gap-3 mb-3">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <h4 className="font-semibold text-gray-900">{getTranslation(language, 'eanResponsive')}</h4>
                      {getStatusIcon(result.checks.eanResponsive.status)}
                    </div>
                    {result.checks.eanResponsive.status === 'completed' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            result.checks.eanResponsive.responsive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.checks.eanResponsive.responsive ? 'EAN Responsive' : 'Non EAN Responsive'}
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            result.checks.eanResponsive.searchFormFound 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getTranslation(language, 'searchForm')}: {result.checks.eanResponsive.searchFormFound ? getTranslation(language, 'found') : getTranslation(language, 'notFound')}
                          </div>
                        </div>
                        {result.checks.eanResponsive.testResults.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-700">{getTranslation(language, 'testDetails')}:</div>
                            {result.checks.eanResponsive.testResults.map((testResult, i) => (
                              <div key={i} className="text-sm text-gray-600">• {testResult}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};