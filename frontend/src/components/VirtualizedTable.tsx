import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  onRowClick?: (item: T) => void;
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  emptyMessage?: string;
  loading?: boolean;
}

export function VirtualizedTable<T extends Record<string, any>>({
  data,
  columns,
  rowHeight = 60,
  onRowClick,
  searchable = true,
  searchKeys = [],
  emptyMessage = 'Nenhum registro encontrado',
  loading = false,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtrar dados por busca
  const filteredData = searchable && searchTerm
    ? data.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        return searchKeys.some((key) => {
          const value = item[key];
          return value?.toString().toLowerCase().includes(searchLower);
        });
      })
    : data;

  // Ordenar dados
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal === bVal) return 0;
        
        const comparison = aVal < bVal ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      })
    : filteredData;

  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10, // Renderiza 10 itens extras para scroll suave
  });

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {searchable && (
          <div className="p-4 border-b dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg skeleton"
                disabled
              />
            </div>
          </div>
        )}
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* Barra de Busca */}
      {searchable && (
        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-all"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Limpar
              </button>
            )}
          </div>
          {sortedData.length > 0 && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {sortedData.length} {sortedData.length === 1 ? 'registro' : 'registros'}
              {searchTerm && ` encontrado${sortedData.length !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      )}

      {/* Cabeçalho da Tabela */}
      <div className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center min-w-full">
          {columns.map((column) => (
            <div
              key={column.key}
              className={`px-4 py-3 font-semibold text-sm text-gray-700 dark:text-gray-300 ${
                column.width || 'flex-1'
              } ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}`}
            >
              {column.sortable ? (
                <button
                  onClick={() => handleSort(column.key)}
                  className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {column.header}
                  {sortColumn === column.key && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {sortDirection === 'asc' ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </motion.div>
                  )}
                </button>
              ) : (
                column.header
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Corpo da Tabela Virtualizado */}
      {sortedData.length === 0 ? (
        <div className="p-12 text-center">
          <Filter className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ height: '600px' }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = sortedData[virtualRow.index];
              return (
                <motion.div
                  key={virtualRow.index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute top-0 left-0 w-full flex items-center border-b dark:border-gray-700 ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors'
                      : ''
                  }`}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className={`px-4 ${column.width || 'flex-1'} ${
                        column.align === 'center'
                          ? 'text-center'
                          : column.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                      }`}
                    >
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {column.render(item)}
                      </div>
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rodapé com Info */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Exibindo {rowVirtualizer.getVirtualItems().length} de {sortedData.length} registros
          </span>
          <span className="text-xs">
            ⚡ Virtualização ativa - Performance otimizada
          </span>
        </div>
      </div>
    </div>
  );
}
