import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const DetailEvaluationResult = ({ responses = [] }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!responses || responses.length === 0) {
        return null;
    }

    // Calculate average score for each criterion across all evaluations
    const calculateCriteriaAverages = () => {
        const criteriaMap = {};

        responses.forEach(response => {
            if (response.responses && Array.isArray(response.responses)) {
                response.responses.forEach(item => {
                    const criteriaName = item.criteria || 'Unknown';

                    if (!criteriaMap[criteriaName]) {
                        criteriaMap[criteriaName] = {
                            totalRating: 0,
                            count: 0,
                            maxPossible: item.maxRating || 100
                        };
                    }

                    criteriaMap[criteriaName].totalRating += item.rating || 0;
                    criteriaMap[criteriaName].count += 1;
                });
            }
        });

        // Convert to array and calculate averages
        return Object.entries(criteriaMap).map(([criteria, data]) => ({
            criteria,
            average: data.totalRating / data.count,
            count: data.count,
            maxPossible: data.maxPossible,
            percentage: (data.totalRating / data.count / data.maxPossible) * 100
        })).sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending
    };

    const criteriaAverages = calculateCriteriaAverages();

    const getPerformanceLevel = (percentage) => {
        if (percentage >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-800 border-green-300', icon: TrendingUp };
        if (percentage >= 60) return { label: 'Good', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Minus };
        return { label: 'Needs Improvement', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: TrendingDown };
    };

    return (
        <div className="mt-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>{isExpanded ? 'Hide' : 'View'} Detailed Criteria Breakdown</span>
            </button>

            {isExpanded && (
                <div className="mt-4 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-100 mb-3">Performance by Criteria</h3>

                    {criteriaAverages.length === 0 ? (
                        <p className="text-gray-400 text-sm">No criteria data available</p>
                    ) : (
                        <div className="space-y-2">
                            {criteriaAverages.map((item, index) => {
                                const performance = getPerformanceLevel(item.percentage);
                                const Icon = performance.icon;

                                return (
                                    <div
                                        key={index}
                                        className="border border-gray-600 rounded-lg p-4 bg-gray-800 hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-100 text-base">{item.criteria}</h4>
                                                <p className="text-xs text-gray-400 mt-1">Based on {item.count} evaluation{item.count !== 1 ? 's' : ''}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${performance.color} flex items-center gap-1`}>
                                                <Icon className="w-3 h-3" />
                                                {performance.label}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="w-full bg-gray-600 rounded-full h-2.5">
                                                    <div
                                                        className={`h-2.5 rounded-full ${item.percentage >= 80 ? 'bg-green-500' :
                                                                item.percentage >= 60 ? 'bg-blue-500' : 'bg-orange-500'
                                                            }`}
                                                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-100">{item.average.toFixed(1)}</p>
                                                <p className="text-xs text-gray-400">/ {item.maxPossible}</p>
                                            </div>
                                        </div>

                                        <div className="mt-2 text-right">
                                            <span className="text-sm font-semibold text-gray-300">{item.percentage.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Summary */}
                    {criteriaAverages.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-800 border border-gray-600 rounded-lg">
                            <h4 className="font-semibold text-gray-100 mb-2">Summary</h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400">Excellent</p>
                                    <p className="text-green-400 font-bold">
                                        {criteriaAverages.filter(c => c.percentage >= 80).length} criteria
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Good</p>
                                    <p className="text-blue-400 font-bold">
                                        {criteriaAverages.filter(c => c.percentage >= 60 && c.percentage < 80).length} criteria
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Needs Work</p>
                                    <p className="text-orange-400 font-bold">
                                        {criteriaAverages.filter(c => c.percentage < 60).length} criteria
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DetailEvaluationResult;