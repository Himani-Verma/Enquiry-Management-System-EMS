import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface PipelineStage {
 id: string;
 name: string;
 color: string;
 isBranch?: boolean;
 isParallel?: boolean;
 isEnd?: boolean;
 isDecision?: boolean;
}

interface StageHistory {
 id: string;
 stageId: string;
 stageName: string;
 timestamp: Date;
 previousStage?: string;
 executiveNotes?: string;
 isEditable?: boolean;
 isAutoFilled?: boolean;
}

const PIPELINE_STAGES: PipelineStage[] = [
 { id: 'enquiry_required', name: 'Enquiry Received', color: 'bg-blue-500' },
 { id: 'contact_initiated', name: 'Contact Initiated', color: 'bg-orange-500' },
 { id: 'feasibility_check', name: 'Feasibility Check', color: 'bg-purple-500', isDecision: true },
 { id: 'qualified', name: 'Qualified', color: 'bg-green-500' },
 { id: 'quotation_sent', name: 'Quotation Sent', color: 'bg-pink-500' },
 { id: 'negotiation_stage', name: 'Negotiation Stage', color: 'bg-red-500' },
 { id: 'converted', name: 'Converted', color: 'bg-emerald-500' },
 { id: 'payment_received', name: 'Payment Received', color: 'bg-teal-500' },
 { id: 'sample_received', name: 'Sample Received', color: 'bg-indigo-500' },
 { id: 'handed_to_smc', name: 'Handed to SMC', color: 'bg-blue-600' },
 { id: 'informed_about_se', name: 'Informed about SE', color: 'bg-blue-700' },
 { id: 'provided_kyc_quotation_to_smc', name: 'Provided KYC & Quotation to SMC', color: 'bg-blue-800' },
 { id: 'process_initiated', name: 'Process Initiated', color: 'bg-green-700' },
 { id: 'ongoing_process', name: 'Ongoing Process', color: 'bg-green-800' },
 { id: 'report_generated', name: 'Report Generated', color: 'bg-green-900' },
 { id: 'sent_to_client_via_mail', name: 'Sent to Client via Mail', color: 'bg-purple-600' },
 { id: 'report_hardcopy_sent', name: 'Report Hardcopy Sent', color: 'bg-purple-700' },
 { id: 'unqualified', name: 'Unqualified (End)', color: 'bg-gray-500', isEnd: true }
];

// Helper function to get pipeline stage order
const getPipelineStageOrder = (stageId: string): number => {
 const index = PIPELINE_STAGES.findIndex(stage => stage.id === stageId);
 return index >= 0 ? index : 999; // Return 999 for unknown stages (put them at the end)
};

interface PipelineFlowchartProps {
 currentStatus: string;
 onStatusChange: (status: string, notes?: string) => void;
 className?: string;
 pipelineHistory?: Array<{
 status: string;
 changedAt: string;
 changedBy: string;
 notes?: string;
 }>;
 readOnly?: boolean;
}

export default function PipelineFlowchart({ currentStatus, onStatusChange, className = '', pipelineHistory = [], readOnly = false }: PipelineFlowchartProps) {
 const [stageHistory, setStageHistory] = useState<StageHistory[]>([]);
 const [editingNotes, setEditingNotes] = useState<string | null>(null);
 const [editNotesText, setEditNotesText] = useState('');
 
 // State for mandatory notes modal
 const [showNotesModal, setShowNotesModal] = useState(false);
 const [pendingStageChange, setPendingStageChange] = useState<string | null>(null);
 const [mandatoryNotes, setMandatoryNotes] = useState('');

 // Debug logging.toISOString(), '🚀🚀🚀');.toISOString());
 
 // Debug: Check if notes are in pipelineHistory
 if (pipelineHistory && pipelineHistory.length > 0) {
 pipelineHistory.forEach((entry, index) => {
 });
 }

 // Effect to log when currentStatus changes
 useEffect(() => {
 }, [currentStatus]);

 // Create a stable key for pipeline history to prevent unnecessary recalculations
 const pipelineHistoryKey = useMemo(() => {
 if (!pipelineHistory || pipelineHistory.length === 0) {
 return `empty-${currentStatus}`;
 }
 return pipelineHistory.map(entry => `${entry.status}-${entry.changedAt}-${entry.changedBy}`).join('|') + `-${currentStatus}`;
 }, [pipelineHistory, currentStatus]);

 // Memoize the pipeline history processing to prevent infinite loops
 const processedStageHistory = useMemo(() => {
 
 let stageHistoryEntries: StageHistory[] = [];
 
 if (pipelineHistory && pipelineHistory.length > 0) {
 
 // Create a map to ensure each stage appears only once
 const stageMap = new Map<string, any>();
 
 // Process pipeline history and keep only the latest entry for each stage
 pipelineHistory.forEach((entry) => {
 
 const existingEntry = stageMap.get(entry.status);
 if (!existingEntry || new Date(entry.changedAt) > new Date(existingEntry.changedAt)) {
 stageMap.set(entry.status, entry);
 }
 });
 
 // Get current stage index
 const currentStageIndex = PIPELINE_STAGES.findIndex(stage => stage.id === currentStatus);
 
 // Get all stages that should be shown (all stages up to and including current stage)
 const reachedPipelineStages = currentStageIndex >= 0 
 ? PIPELINE_STAGES.slice(0, currentStageIndex + 1)
 : PIPELINE_STAGES.filter(stage => {
 // Fallback: if currentStatus not found in PIPELINE_STAGES, show stages from history
 const reachedStages = new Set<string>();
 stageMap.forEach((entry) => reachedStages.add(entry.status));
 if (currentStatus) reachedStages.add(currentStatus);
 return reachedStages.has(stage.id);
 });
 
 // Create stage history entries following the pipeline sequence
 stageHistoryEntries = reachedPipelineStages.map((stage, index) => {
 const historyEntry = stageMap.get(stage.id);
 const isAutoFilled = historyEntry && historyEntry.notes && historyEntry.notes.includes('Auto-filled stage:');
 
 // Use the notes from the backend if available, otherwise use default text
 let executiveNotes = 'Stage reached';
 if (historyEntry && historyEntry.notes) {
 executiveNotes = historyEntry.notes;
 } else if (stage.id === currentStatus) {
 executiveNotes = 'Current status';
 }
 
 const stageEntry = {
 id: `stage_${stage.id}_${index}`,
 stageId: stage.id,
 stageName: stage.name,
 timestamp: historyEntry ? new Date(historyEntry.changedAt) : new Date(),
 previousStage: index > 0 ? reachedPipelineStages[index - 1].id : undefined,
 executiveNotes: executiveNotes,
 isEditable: true,
 isAutoFilled: isAutoFilled
 };
 return stageEntry;
 });
 
 } else if (currentStatus) {
 // No pipeline history, create entries for all stages up to current status
 const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === currentStatus);
 if (currentStageIndex >= 0) {
 
 // Create entries for all stages from 0 to currentStageIndex
 stageHistoryEntries = PIPELINE_STAGES.slice(0, currentStageIndex + 1).map((stage, index) => ({
 id: `stage_${stage.id}_${index}`,
 stageId: stage.id,
 stageName: stage.name,
 timestamp: new Date(),
 previousStage: index > 0 ? PIPELINE_STAGES[index - 1].id : undefined,
 executiveNotes: stage.id === currentStatus ? 'Current status' : 'Stage completed',
 isEditable: true,
 isAutoFilled: stage.id !== currentStatus // Mark auto-filled except current
 }));
 }
 }
 return stageHistoryEntries;
 }, [pipelineHistoryKey]);

 // Update stage history when processed data changes
 const prevProcessedHistoryRef = useRef<StageHistory[]>([]);
 
 useEffect(() => {
 // Only update if the processed history actually changed
 const hasChanged = JSON.stringify(processedStageHistory) !== JSON.stringify(prevProcessedHistoryRef.current);
 
 if (hasChanged) {
 // Use the processed history directly - it already contains the backend notes
 setStageHistory(processedStageHistory);
 prevProcessedHistoryRef.current = processedStageHistory;
 }
 }, [processedStageHistory]);

 const handleStageChange = useCallback((newStatus: string) => {
 if (readOnly) {
 return; // Don't allow changes in read-only mode
 }
 
 // Store the pending stage change and show the notes modal
 setPendingStageChange(newStatus);
 setMandatoryNotes('');
 setShowNotesModal(true);
 }, [readOnly]);

 const startEditingNotes = useCallback((entryId: string, currentNotes: string) => {
 setEditingNotes(entryId);
 setEditNotesText(currentNotes || '');
 }, []);

 const saveEditedNotes = useCallback((entryId: string) => {
 const trimmedNotes = editNotesText.trim();
 
 // Find the entry to get the stageId
 const entry = stageHistory.find(e => e.id === entryId);
 if (entry) {
 // Update the local state immediately for better UX
 setStageHistory(prev => 
 prev.map(entry => 
 entry.id === entryId 
 ? { ...entry, executiveNotes: trimmedNotes || undefined }
 : entry
 )
 );
 
 // TODO: In the future, you might want to save edited notes to the backend
 // For now, we'll just update the local state
 }
 
 setEditingNotes(null);
 setEditNotesText('');
 }, [editNotesText, stageHistory]);

 const cancelEditingNotes = useCallback(() => {
 setEditingNotes(null);
 setEditNotesText('');
 }, []);

 // Functions to handle mandatory notes modal
 const handleConfirmStageChange = useCallback(() => {
 if (!pendingStageChange || !mandatoryNotes.trim()) {
 return; // Don't proceed if no stage or empty notes
 }
 
 // Call the onStatusChange callback with the notes - backend will save them
 onStatusChange(pendingStageChange, mandatoryNotes.trim());
 
 // Close the modal and reset state
 setShowNotesModal(false);
 setPendingStageChange(null);
 setMandatoryNotes('');
 }, [pendingStageChange, mandatoryNotes, onStatusChange]);

 const handleCancelStageChange = useCallback(() => {
 setShowNotesModal(false);
 setPendingStageChange(null);
 setMandatoryNotes('');
 }, []);

 // Sort stage history by pipeline stage order (1, 2, 3, 4, 5...)
 const sortedStageHistory = [...stageHistory].sort((a, b) => {
 const orderA = getPipelineStageOrder(a.stageId);
 const orderB = getPipelineStageOrder(b.stageId);
 
 // Primary sort: by stage order
 if (orderA !== orderB) {
 return orderA - orderB;
 }
 
 // Secondary sort: by timestamp if same stage (for multiple entries of same stage)
 return a.timestamp.getTime() - b.timestamp.getTime();
 });



 const getStageStatus = (stageId: string) => {
 const currentIndex = PIPELINE_STAGES.findIndex(s => s.id === currentStatus);
 const stageIndex = PIPELINE_STAGES.findIndex(s => s.id === stageId);
 
 // Handle unqualified status
 if (currentStatus === 'unqualified' && stageId === 'unqualified') {
 return 'current';
 }
 
 if (currentStatus === 'unqualified' && stageId !== 'unqualified') {
 return 'disabled';
 }
 
 if (stageId === 'unqualified' && currentStatus !== 'unqualified') {
 return 'disabled';
 }
 
 // For normal pipeline progression
 if (stageIndex < currentIndex) {
 return 'completed'; // All stages before current should be green
 } else if (stageIndex === currentIndex) {
 return 'current'; // Current stage should be blue/active
 } else {
 return 'pending'; // Future stages should be gray
 }
 };

 const renderStage = (stage: PipelineStage, index: number, isLastStage: boolean = false) => {
 const status = getStageStatus(stage.id);
 const isCurrent = currentStatus === stage.id;
 
 let statusClass = '';
 let borderClass = '';
 let iconClass = '';
 
 switch (status) {
 case 'current':
 statusClass = 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl transform scale-110 animate-pulse';
 borderClass = 'border-2 border-blue-400 ring-4 ring-blue-200';
 iconClass = 'text-blue-200';
 break;
 case 'completed':
 statusClass = 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg';
 borderClass = 'border-2 border-green-400';
 iconClass = 'text-green-200';
 break;
 case 'pending':
 statusClass = 'bg-white text-gray-700 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:shadow-lg transition-all';
 borderClass = 'border-2 border-gray-300 hover:border-blue-400';
 iconClass = 'text-gray-400';
 break;
 case 'disabled':
 statusClass = 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-60';
 borderClass = 'border-2 border-gray-200';
 iconClass = 'text-gray-300';
 break;
 }

 const stageClasses = `
 relative px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 
 w-[110px] h-[60px] flex flex-col items-center justify-center text-center ${statusClass} ${borderClass}
 ${stage.isDecision ? 'ring-1 ring-purple-400 ring-offset-1' : ''}
 ${stage.isEnd ? 'opacity-75' : ''}
 ${!stage.isEnd ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : 'cursor-not-allowed'}
 `;

 return (
 <div key={stage.id} className="flex items-center">
 {/* Stage Box */}
 <button
 className={stageClasses}
 onClick={() => !stage.isEnd && !readOnly && handleStageChange(stage.id)}
 disabled={stage.isEnd || readOnly}
 >
 {/* Status Icon */}
 <div className="flex items-center justify-center mb-1">
 {status === 'completed' && (
 <svg className={`w-4 h-4 ${iconClass}`} fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
 </svg>
 )}
 {status === 'current' && (
 <svg className={`w-4 h-4 ${iconClass} animate-spin`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
 </svg>
 )}
 {status === 'pending' && (
 <svg className={`w-4 h-4 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 )}
 </div>
 <div className="font-bold text-[10px] leading-tight px-1">{stage.name}</div>
 {isCurrent && (
 <div className="text-[8px] mt-1 opacity-90 font-semibold flex items-center justify-center gap-0.5">
 <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
 Active
 </div>
 )}
 </button>
 
 {/* Arrow (except for last stage) */}
 {!isLastStage && (
 <div className="mx-1.5 flex items-center">
 <div className={`w-4 h-0.5 ${
 getStageStatus(stage.id) === 'completed' ? 'bg-green-400' : 'bg-gray-300'
 }`}></div>
 <svg className={`w-3 h-3 ${
 getStageStatus(stage.id) === 'completed' ? 'text-green-400' : 'text-gray-300'
 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 )}
 </div>
 );
 };

 const renderMainPipeline = () => {
 // Show stages up to feasibility check
 const initialStages = PIPELINE_STAGES.filter(stage => 
 ['enquiry_required', 'contact_initiated', 'feasibility_check'].includes(stage.id)
 );
 
 const isQualifiedPath = ['qualified', 'quotation_sent', 'negotiation_stage', 'converted', 'payment_received', 'sample_received', 'handed_to_smc', 'informed_about_se', 'provided_kyc_quotation_to_smc'].includes(currentStatus);
 const isUnqualifiedPath = currentStatus === 'unqualified';
 
 return (
 <div className="mb-8">
 <h4 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
 <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
 Initial Pipeline Flow
 </h4>
 <div className="flex items-center justify-start gap-2 overflow-x-auto pb-4">
 {initialStages.map((stage, index) => 
 renderStage(stage, index, false)
 )}
 
 {/* Branching options directly under Feasibility Check */}
 <div className="mx-2 flex items-center">
 <div className={`w-8 h-0.5 ${
 getStageStatus('feasibility_check') === 'completed' ? 'bg-green-400' : 'bg-gray-300'
 }`}></div>
 <svg className={`w-4 h-4 ${
 getStageStatus('feasibility_check') === 'completed' ? 'text-green-400' : 'text-gray-300'
 }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 
 {/* Vertical branching options */}
 <div className="flex flex-col gap-2">
 {/* Qualified Option */}
 <button
 onClick={() => !readOnly && handleStageChange('qualified')}
 disabled={readOnly}
 className={`relative px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 min-w-[140px] max-w-[160px] text-center ${
 isQualifiedPath 
 ? 'bg-green-500 text-white shadow-md border-2 border-green-600' 
 : 'bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50'
 } ${readOnly ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
 >
 <div className="font-semibold text-xs leading-tight">Qualified</div>
 {isQualifiedPath && (
 <div className="text-xs mt-1 opacity-90">Current</div>
 )}
 </button>
 
 {/* Unqualified Option */}
 <button
 onClick={() => !readOnly && handleStageChange('unqualified')}
 disabled={readOnly}
 className={`relative px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 min-w-[140px] max-w-[160px] text-center ${
 isUnqualifiedPath 
 ? 'bg-gray-500 text-white shadow-md border-2 border-gray-600' 
 : 'bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50'
 } ${readOnly ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
 >
 <div className="font-semibold text-xs leading-tight">Unqualified</div>
 {isUnqualifiedPath && (
 <div className="text-xs mt-1 opacity-90">Current</div>
 )}
 </button>
 </div>
 </div>
 </div>
 );
 };

 const renderQualifiedPipeline = () => {
 // Only show if on qualified path
 const isQualifiedPath = ['qualified', 'quotation_sent', 'negotiation_stage', 'converted', 'payment_received', 'sample_received', 'handed_to_smc', 'informed_about_se', 'provided_kyc_quotation_to_smc'].includes(currentStatus);
 
 if (!isQualifiedPath) return null;
 
 const qualifiedStages = PIPELINE_STAGES.filter(stage => 
 ['qualified', 'quotation_sent', 'negotiation_stage', 'converted', 'payment_received', 'sample_received', 'handed_to_smc', 'informed_about_se', 'provided_kyc_quotation_to_smc'].includes(stage.id)
 );
 
 return (
 <div className="mt-8 mb-8">
 <h4 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
 <div className="w-5 h-5 bg-green-500 rounded-full"></div>
 Qualified Pipeline Flow
 </h4>
 <div className="flex items-center justify-start gap-2 overflow-x-auto pb-4">
 {qualifiedStages.map((stage, index) => 
 renderStage(stage, index, index === qualifiedStages.length - 1)
 )}
 </div>
 </div>
 );
 };

 const renderParallelProcess = () => {
 // Only show if converted or beyond
 const isConvertedOrBeyond = ['converted', 'payment_received', 'sample_received', 'handed_to_smc', 'informed_about_se', 'provided_kyc_quotation_to_smc', 'process_initiated', 'ongoing_process', 'report_generated', 'sent_to_client_via_mail', 'report_hardcopy_sent'].includes(currentStatus);
 
 if (!isConvertedOrBeyond) return null;
 
 const parallelStages = [
 'process_initiated',
 'ongoing_process', 
 'report_generated',
 'sent_to_client_via_mail',
 'report_hardcopy_sent'
 ];
 
 return (
 <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
 <div className="text-center mb-6">
 <div className="flex items-center justify-center gap-3 mb-3">
 <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
 <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
 </svg>
 </div>
 <h4 className="text-lg font-bold text-gray-800">Parallel Process (After Conversion)</h4>
 </div>
 <p className="text-sm text-gray-900">Runs concurrently with the main pipeline stages</p>
 <div className="w-40 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto rounded-full mt-2"></div>
 </div>
 
 <div className="flex items-center justify-start gap-2 overflow-x-auto pb-4">
 {parallelStages.map((stageId, index) => {
 const stage = PIPELINE_STAGES.find(s => s.id === stageId);
 if (!stage) return null;
 return renderStage(stage, index, index === parallelStages.length - 1);
 })}
 </div>
 </div>
 );
 };

 return (
 <div className={`bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200 shadow-lg ${className}`}>
 <div className="text-center mb-3">
 <div className="flex items-center justify-center gap-2 mb-2">
 <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
 </svg>
 </div>
 <h3 className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pipeline Flowchart</h3>
 </div>
 <p className="text-xs text-gray-700 mb-2">Click stage to update - Scroll to see all</p>
 <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg inline-block shadow-md">
 <span className="text-xs font-semibold text-white">Current: </span>
 <span className="text-xs font-bold text-white">{PIPELINE_STAGES.find(s => s.id === currentStatus)?.name || currentStatus}</span>
 </div>
 </div>
 
 {/* Single Horizontal Scrollable Pipeline */}
 <div className="mb-3">
 <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-custom">
 {PIPELINE_STAGES.filter(stage => stage.id !== 'unqualified').map((stage, index, arr) => 
 renderStage(stage, index, index === arr.length - 1)
 )}
 </div>
 
 {/* Unqualified Stage (shown separately at bottom) */}
 <div className="mt-2 pt-2 border-t border-gray-300">
 <div className="flex items-center gap-1">
 <span className="text-xs text-gray-900 font-medium">Alternative:</span>
 {renderStage(PIPELINE_STAGES.find(s => s.id === 'unqualified')!, 0, true)}
 </div>
 </div>
 </div>
 
 {/* Stage History with Executive Notes */}
 <div className="mt-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-md">
 <div className="flex items-center justify-between mb-2">
 <div>
 <h4 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
 <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
 <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
 </svg>
 </div>
 Stage History & Notes
 </h4>
 <p className="text-[10px] text-blue-700">Timeline with updates</p>
 </div>
 <div className="text-right">
 <div className="text-base font-bold text-blue-600">{stageHistory.length}</div>
 <div className="text-[9px] text-blue-700">Updates</div>
 </div>
 </div>
 
 {stageHistory.length === 0 ? (
 <div className="text-center py-4">
 <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
 <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <p className="text-xs text-black mb-1">No stage updates yet</p>
 <p className="text-[10px] text-black">Click a stage to update status</p>
 </div>
 ) : (
 <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-custom pr-1">
 {sortedStageHistory.map((entry, index) => (
 <div key={entry.id} className={`rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-200 ${
 entry.isAutoFilled 
 ? 'bg-blue-50 border-blue-300' 
 : 'bg-white border-gray-300'
 }`}>
 <div className="p-4">
 {/* Header with stage info and status */}
 <div className="flex items-start justify-between mb-4 pb-3 border-b-2 border-gray-200">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <div className="flex items-center gap-2">
 <span className="text-xl font-bold text-gray-900">{entry.stageName}</span>
 <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full shadow-sm">
 Stage {getPipelineStageOrder(entry.stageId) + 1}
 </span>
 {entry.isAutoFilled && (
 <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-sm">
 Auto-filled
 </span>
 )}
 </div>
 </div>
 
 {/* Transition info */}
 {entry.previousStage && (
 <div className="flex items-center gap-2 text-sm text-black mb-2">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
 </svg>
 <span>Transitioned from <span className="font-medium">{PIPELINE_STAGES.find(s => s.id === entry.previousStage)?.name || entry.previousStage}</span></span>
 </div>
 )}
 </div>
 
 {/* Timestamp */}
 <div className="text-right">
 <div className="text-sm font-medium text-black">
 {entry.timestamp.toLocaleDateString('en-US', { 
 month: 'short', 
 day: 'numeric', 
 year: 'numeric' 
 })}
 </div>
 <div className="text-xs text-black">
 {entry.timestamp.toLocaleTimeString('en-US', { 
 hour: '2-digit', 
 minute: '2-digit',
 hour12: true 
 })}
 </div>
 </div>
 </div>
 
 {/* Executive Notes - Prominently Displayed */}
 {entry.executiveNotes && (
 <div className="mt-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg shadow-md">
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2">
 <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
 </svg>
 <span className="text-base font-bold text-amber-900">Executive Notes *</span>
 </div>
 {!editingNotes && !readOnly && (
 <button
 onClick={() => startEditingNotes(entry.id, entry.executiveNotes || '')}
 className="px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-xs font-medium transition-colors"
 >
 Edit Notes
 </button>
 )}
 </div>
 {editingNotes === entry.id ? (
 <div>
 <textarea
 className="w-full p-3 border-2 border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-gray-900 placeholder-gray-500 bg-white"
 rows={4}
 value={editNotesText}
 onChange={(e) => setEditNotesText(e.target.value)}
 placeholder="Enter your notes here..."
 ></textarea>
 <div className="flex justify-end gap-2 mt-2">
 <button
 onClick={() => saveEditedNotes(entry.id)}
 className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
 >
 Save
 </button>
 <button
 onClick={cancelEditingNotes}
 className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 text-sm font-medium"
 >
 Cancel
 </button>
 </div>
 </div>
 ) : (
 <div className="text-base text-amber-950 font-medium leading-relaxed bg-white p-3 rounded border border-amber-200">{entry.executiveNotes}</div>
 )}
 </div>
 )}
 
 {/* Add Notes Button for stages without notes */}
 {!entry.executiveNotes && (
 <div className="mt-3 p-4 bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-dashed border-gray-400 rounded-lg">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
 </svg>
 <span className="text-base font-semibold text-gray-700">Executive Notes *</span>
 </div>
 <span className="text-sm text-gray-900 italic">No notes added yet</span>
 {!readOnly && (
 <button
 onClick={() => startEditingNotes(entry.id, '')}
 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors shadow-md hover:shadow-lg"
 >
 + Add Notes
 </button>
 )}
 </div>
 </div>
 )}
 
 {/* Progress indicator */}
 <div className="mt-3 pt-3 border-t border-gray-100">
 <div className="flex items-center justify-between text-xs text-black">
 <span>Stage {getPipelineStageOrder(entry.stageId) + 1} of {PIPELINE_STAGES.length}</span>
 <span>{Math.round(((getPipelineStageOrder(entry.stageId) + 1) / PIPELINE_STAGES.length) * 100)}% complete</span>
 </div>
 <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
 <div 
 className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
 style={{ width: `${((getPipelineStageOrder(entry.stageId) + 1) / PIPELINE_STAGES.length) * 100}%` }}
 ></div>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 
 {/* Legend */}
 <div className="mt-6 pt-4 border-t border-gray-200">
 <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
 <span>Current Stage</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 bg-green-500 rounded-full"></div>
 <span>Completed</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 bg-white border-2 border-gray-300 rounded-full"></div>
 <span>Pending</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 bg-gray-200 border-2 border-gray-300 rounded-full"></div>
 <span>Disabled</span>
 </div>
 </div>
 </div>

 {/* Mandatory Notes Modal */}
 {showNotesModal && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
 <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
 <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
 </svg>
 </div>
 <div>
 <h3 className="text-lg font-semibold text-gray-900">Add Notes to Proceed</h3>
 <p className="text-sm text-gray-900">Notes are required to move to the next stage</p>
 </div>
 </div>
 
 <div className="mb-4">
 <div className="flex items-center gap-2 mb-2">
 <span className="text-sm font-medium text-gray-700">Moving to:</span>
 <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
 {PIPELINE_STAGES.find(s => s.id === pendingStageChange)?.name || pendingStageChange}
 </span>
 </div>
 </div>
 
 <div className="mb-6">
 <label htmlFor="mandatory-notes" className="block text-sm font-medium text-gray-700 mb-2">
 Executive Notes <span className="text-red-500">*</span>
 </label>
 <textarea
 id="mandatory-notes"
 className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
 rows={4}
 value={mandatoryNotes}
 onChange={(e) => setMandatoryNotes(e.target.value)}
 placeholder="Please provide notes about this stage transition..."
 autoFocus
 />
 {!mandatoryNotes.trim() && (
 <p className="text-red-500 text-xs mt-1">Notes are required to proceed</p>
 )}
 </div>
 
 <div className="flex gap-3 justify-end">
 <button
 onClick={handleCancelStageChange}
 className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
 >
 Cancel
 </button>
 <button
 onClick={handleConfirmStageChange}
 disabled={!mandatoryNotes.trim()}
 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
 mandatoryNotes.trim()
 ? 'bg-blue-600 text-white hover:bg-blue-700'
 : 'bg-gray-300 text-gray-800 cursor-not-allowed'
 }`}
 >
 Proceed to Stage
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}