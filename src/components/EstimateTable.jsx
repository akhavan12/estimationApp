import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

const EstimateTable = ({ results, onReset }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">
              Renovation Estimate
            </h2>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>New Estimate</span>
          </button>
        </div>

        {/* Estimate Table - Xactimate Format */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-12">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tax
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  O&P
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider bg-blue-50">
                  RCV
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.rooms.map((room, roomIndex) => {
                let itemNumber = 1;
                return (
                  <React.Fragment key={roomIndex}>
                    {/* Room Header Row */}
                    <tr className="bg-blue-50 border-t-2 border-b border-blue-200">
                      <td colSpan="8" className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">
                              {room.name}
                            </h3>
                            {(room.age || room.condition) && (
                              <p className="text-xs text-gray-600 mt-1">
                                Age: {room.age || 0} years | Condition: {room.condition || 'Average'}
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {room.dimensions.length.feet}' {room.dimensions.length.inches}" ×{' '}
                            {room.dimensions.width.feet}' {room.dimensions.width.inches}" ×{' '}
                            {room.dimensions.height.feet}' {room.dimensions.height.inches}"
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Line Items for this Room */}
                    {room.line_items && room.line_items.length > 0 ? (
                      room.line_items.map((item, itemIndex) => {
                        const currentItemNumber = itemNumber++;
                        return (
                          <tr
                            key={itemIndex}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-3 py-2 text-sm text-gray-600 text-center">
                              {currentItemNumber}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700">
                              {item.description}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 text-right">
                              {formatNumber(item.qty_billed || item.qty)}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-700 text-center">
                              {item.unit}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 text-right">
                              {formatCurrency(item.unit_cost)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 text-right">
                              {formatCurrency(item.tax || 0)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 text-right">
                              {formatCurrency(item.op || 0)}
                            </td>
                            <td className="px-4 py-2 text-sm font-bold text-gray-800 text-right bg-blue-50">
                              {formatCurrency(item.rcv)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-4 py-3 text-sm text-gray-500 italic text-center">
                          No line items for this room
                        </td>
                      </tr>
                    )}

                    {/* Room Total Row */}
                    <tr className="bg-gray-100 border-t border-b border-gray-300 font-semibold">
                      <td colSpan="5" className="px-4 py-3 text-sm text-gray-700 text-right">
                        Room Total:
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {formatCurrency(room.totals.tax || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {formatCurrency(room.totals.op || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-800 text-right bg-blue-50">
                        {formatCurrency(room.totals.rcv)}
                      </td>
                    </tr>

                    {/* Spacer row between rooms */}
                    {roomIndex < results.rooms.length - 1 && (
                      <tr>
                        <td colSpan="8" className="px-4 py-2"></td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot>
              {/* Project Grand Total */}
              <tr className="bg-blue-600 text-white border-t-4 border-blue-700">
                <td colSpan="5" className="px-4 py-4 text-lg font-bold text-right">
                  GRAND TOTAL:
                </td>
                <td className="px-4 py-4 text-lg font-bold text-right">
                  {formatCurrency(results.project_totals.tax || 0)}
                </td>
                <td className="px-4 py-4 text-lg font-bold text-right">
                  {formatCurrency(results.project_totals.op || 0)}
                </td>
                <td className="px-4 py-4 text-xl font-bold text-right bg-blue-700">
                  {formatCurrency(results.project_totals.rcv)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary Information - Xactimate Style */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Base</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatCurrency(results.project_totals.base_cost || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Tax</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatCurrency(results.project_totals.tax || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total O&P</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatCurrency(results.project_totals.op || 0)}
            </p>
          </div>
          <div className="border-l-2 border-gray-300 pl-4">
            <p className="text-sm text-gray-600 mb-1">Grand Total RCV</p>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(results.project_totals.rcv)}
            </p>
          </div>
        </div>

        {/* Additional Info (if ACV/depreciation exists) */}
        {(results.project_totals.acv || results.project_totals.depreciation_amount) && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Depreciation</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatCurrency(results.project_totals.depreciation_amount || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Check Amount (ACV)</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(results.project_totals.acv || results.project_totals.rcv)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstimateTable;
