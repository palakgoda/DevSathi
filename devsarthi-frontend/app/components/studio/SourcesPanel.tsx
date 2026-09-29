import React, { useState, useMemo } from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Plus,
  FileText,
  PlayCircle,
  File,
  Image as ImageIcon,
  Video,
  Trash2,
  Code2,
  FolderOpen,
  Folder,
  ChevronRight,
  ChevronDown,
  FilePlus,
  FolderPlus,
  Sparkles
} from 'lucide-react';
import { FileItem } from '../../studio/page';

type SourcesPanelProps = {
  subject?: string;
  topic?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  files: FileItem[];
  activeFile: string;
  onFileSelect: (fileName: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onYoutubeLink: () => void;
  onDeleteSource: (fileName: string) => void;
  onCreateNode?: (name: string, type: 'file' | 'folder', parentId: string | null) => void;
};

export default function SourcesPanel({
  subject,
  topic,
  isOpen,
  setIsOpen,
  files,
  activeFile,
  onFileSelect,
  onFileUpload,
  onYoutubeLink,
  onDeleteSource,
  onCreateNode
}: SourcesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // 1. Filter files based on search input
  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.language && f.language.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper to get matching icon and clean label
  const getFileInfo = (file: FileItem) => {
    switch (file.type) {
      case 'code':
        return { Icon: Code2, label: `${file.language?.toUpperCase() || 'CODE'} File` };
      case 'pdf':
        return { Icon: FileText, label: 'PDF Document' };
      case 'image':
        return { Icon: ImageIcon, label: 'Image File' };
      case 'video':
        return { Icon: Video, label: 'Video File' };
      case 'youtube':
        return { Icon: PlayCircle, label: 'YouTube Video' };
      case 'folder':
        return { Icon: expandedFolders.has(file.id || '') ? FolderOpen : Folder, label: 'Folder' };
      case 'document':
      case 'text':
        return { Icon: FileText, label: `${file.language?.toUpperCase() || 'TXT'} Doc` };
      default:
        return { Icon: File, label: `${file.language?.toUpperCase() || 'FILE'}` };
    }
  };

  const toggleFolder = (folderId: string) => {
    const next = new Set(expandedFolders);
    if (next.has(folderId)) {
      next.delete(folderId);
    } else {
      next.add(folderId);
    }
    setExpandedFolders(next);
  };

  const handleNewNode = (type: 'file' | 'folder') => {
    const name = prompt(`Enter new ${type} name:`);
    if (name && name.trim()) {
      // Find currently selected folder if any, or null for root
      let parentId = null;
      const activeObj = files.find(f => f.name === activeFile);
      if (activeObj) {
        if (activeObj.type === 'folder') {
          parentId = activeObj.id;
          if (activeObj.id && !expandedFolders.has(activeObj.id)) {
            toggleFolder(activeObj.id);
          }
        } else {
          parentId = activeObj.parent_id || null;
        }
      }
      onCreateNode?.(name.trim(), type, parentId || null);
    }
  };

  // Build tree
  const buildTree = (items: FileItem[], parentId: string | null = null): FileItem[] => {
    return items.filter(i => (i.parent_id || null) === parentId);
  };

  const renderTree = (nodes: FileItem[], level = 0) => {
    return nodes.map((file) => {
      const isActive = file.name === activeFile;
      const { Icon, label } = getFileInfo(file);
      const isFolder = file.type === 'folder';
      const isExpanded = file.id ? expandedFolders.has(file.id) : false;
      const children = isFolder && file.id ? buildTree(filteredFiles, file.id) : [];

      return (
        <div key={file.id || file.name} className="flex flex-col">
          <div
            onClick={() => {
              if (isFolder && file.id) {
                toggleFolder(file.id);
                onFileSelect(file.name); // optionally set folder as active
              } else {
                onFileSelect(file.name);
              }
            }}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            className={`py-2 pr-2 rounded-lg cursor-pointer transition-all group relative flex items-center justify-between ${
              isActive
                ? 'bg-white border border-[#013626] shadow-sm'
                : 'bg-transparent hover:bg-white/60 border border-transparent hover:border-[#c0c9c2]/50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              {isFolder && (
                <div className="w-4 h-4 flex items-center justify-center text-gray-400 group-hover:text-[#013626]">
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </div>
              )}
              {!isFolder && <div className="w-4" />} {/* Spacer for files */}
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#013626]' : (isFolder ? 'text-amber-500' : 'text-gray-500 group-hover:text-[#013626]')}`} />
              <div className="min-w-0 flex flex-col justify-center">
                <h3 className={`text-xs font-semibold truncate transition-colors ${isActive ? 'text-[#013626]' : 'text-gray-800 group-hover:text-[#013626]'}`}>
                  {file.name}
                </h3>
              </div>
            </div>

            {/* AI Summary Tooltip */}
            {!isFolder && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 bg-white border border-[#c0c9c2] shadow-xl rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <div className="flex items-center gap-1.5 mb-1.5 border-b border-gray-100 pb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-[#013626]">AI Summary</span>
                </div>
                <p className="text-[10px] text-gray-600 leading-tight">
                  {file.type === 'code' ? 'Code file containing logic or components. Analyzed for syntax.' : 'Reference material. Parsed and ready for DevSarthi context.'}
                </p>
                <div className="mt-2 flex gap-1">
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold uppercase">{file.type}</span>
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold uppercase">{file.language || 'unknown'}</span>
                </div>
              </div>
            )}

            {/* Delete Button on Hover */}
            {onDeleteSource && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSource(file.name);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 text-gray-400 hover:bg-red-50 transition-all rounded shrink-0"
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          {isFolder && isExpanded && children.length > 0 && (
            <div className="flex flex-col gap-0.5 mt-0.5 relative">
              {/* Optional: Add a left border for vertical line tree visual */}
              <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-gray-200/60" style={{ left: `${level * 16 + 18}px` }}></div>
              {renderTree(children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };


  // Collapsed Sidebar View
  if (!isOpen) {
    return (
      <div className="w-full glass-panel rounded-xl flex flex-col z-10 relative overflow-hidden transition-all duration-300">
        <div className="p-4 border-b border-outline-variant/30 flex justify-center items-center">
          <button
            className="text-on-surface-variant hover:text-primary transition-colors"
            onClick={() => setIsOpen(true)}
            title="Open Sources Panel"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const rootNodes = buildTree(filteredFiles, null);

  // Expanded Sidebar View
  return (
    <div className="w-full glass-panel rounded-xl flex flex-col z-10 relative overflow-hidden transition-all duration-300 h-full bg-[#FDF9EF] border border-[#c0c9c2]">
      {/* Header */}
      <div className="p-4 border-b border-[#c0c9c2]/40 flex justify-between items-center bg-white/40">
        <h2 className="font-title-md text-[#013626] font-bold text-sm tracking-wide">Workspace</h2>
        <div className="flex items-center gap-1">
          <button
            className="text-gray-500 hover:text-[#013626] transition-colors p-1"
            onClick={() => handleNewNode('file')}
            title="New File"
          >
            <FilePlus className="w-4 h-4" />
          </button>
          <button
            className="text-gray-500 hover:text-[#013626] transition-colors p-1"
            onClick={() => handleNewNode('folder')}
            title="New Folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
          <button
            className="text-gray-500 hover:text-[#013626] transition-colors p-1"
            onClick={() => setIsOpen(false)}
            title="Collapse Panel"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Action Buttons */}
        <div className="p-4 pb-2 flex flex-col gap-2.5">
          <div className="flex gap-2">
            <label className="flex-1 py-1.5 px-3 bg-[#013626] hover:bg-[#001f14] text-white font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              Upload
              <input
                type="file"
                className="hidden"
                onChange={onFileUpload}
                accept=".py,.js,.jsx,.ts,.tsx,.java,.cpp,.c,.html,.css,.json,.pdf,.png,.jpg,.jpeg,.webp,.mp4,.webm,.txt,.md,.csv"
              />
            </label>
            <button
              onClick={onYoutubeLink}
              className="flex-1 py-1.5 px-3 bg-white hover:bg-[#f7f3e9] text-[#013626] font-medium text-xs border border-[#c0c9c2] rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm"
              title="Add YouTube Link"
            >
              <PlayCircle className="w-3.5 h-3.5 text-red-600" />
              Link
            </button>
          </div>

          {files.length > 0 && (
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#c0c9c2] rounded-lg py-1.5 pl-8 pr-3 text-xs focus:ring-1 focus:ring-[#013626] focus:outline-none placeholder:text-gray-400"
                placeholder="Search..."
                type="text"
              />
            </div>
          )}
        </div>

        {/* Files List Tree */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 flex flex-col gap-1">
          {files.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#c0c9c2] rounded-xl bg-white/30 my-auto min-h-[180px] mx-2">
              <div className="w-10 h-10 rounded-full bg-[#f7f3e9] flex items-center justify-center mb-2">
                <FolderOpen className="w-5 h-5 text-[#013626]" />
              </div>
              <p className="text-xs font-semibold text-[#013626]">Workspace is empty</p>
              <p className="text-[11px] text-[#4B635B] mt-1 max-w-[150px]">
                Create a new file or upload resources to begin
              </p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 text-gray-400 min-h-[160px]">
              <p className="text-xs font-medium">No matching items found</p>
            </div>
          ) : (
            renderTree(rootNodes)
          )}
        </div>
      </div>
    </div>
  );
}