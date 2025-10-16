import React from 'react';
import { Package, Clock, CheckCircle, XCircle, Loader, StopCircle } from 'lucide-react';
import { useDomainBatches, DomainBatch } from '../../hooks/useDomainBatches';

export const BatchHistory: React.FC = () => {
  const { batches, loading, getBatches } = useDomainBatches();

  React.useEffect(() => {
    getBatches();
  }, []);

  const getStatusIcon = (status: DomainBatch['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Loader className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'stopped':
        return <StopCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: DomainBatch['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'stopped':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: DomainBatch['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'error':
        return 'Error';
      case 'stopped':
        return 'Stopped';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const getProgressPercentage = (batch: DomainBatch) => {
    if (batch.total_domains === 0) return 0;
    return Math.round((batch.completed_domains / batch.total_domains) * 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="h-6 w-6 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">Batch History</h2>
        </div>
        <p className="text-gray-600 text-center py-8">
          No batches yet. Start an analysis to create your first batch.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Package className="h-6 w-6 text-gray-600" />
        <h2 className="text-xl font-bold text-gray-900">Batch History</h2>
        <span className="ml-auto text-sm text-gray-500">
          {batches.length} batch{batches.length > 1 ? 'es' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {batches.map((batch) => {
          const progressPercentage = getProgressPercentage(batch);

          return (
            <div
              key={batch.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(batch.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {batch.name}
                      </h3>
                      {batch.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {batch.description}
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium border flex-shrink-0 ${getStatusColor(
                        batch.status
                      )}`}
                    >
                      {getStatusLabel(batch.status)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Progress: {batch.completed_domains} / {batch.total_domains} domains
                      </span>
                      <span className="font-medium text-gray-900">
                        {progressPercentage}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          batch.status === 'completed'
                            ? 'bg-green-600'
                            : batch.status === 'error'
                            ? 'bg-red-600'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Created: {new Date(batch.created_at).toLocaleDateString()}{' '}
                        {new Date(batch.created_at).toLocaleTimeString()}
                      </span>
                      {batch.updated_at !== batch.created_at && (
                        <span>
                          Updated: {new Date(batch.updated_at).toLocaleDateString()}{' '}
                          {new Date(batch.updated_at).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
