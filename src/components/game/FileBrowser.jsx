import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { File, Folder, Lock, AlertCircle, Volume2, Image, FileText, CheckCircle, X, Unlock, Key } from "lucide-react";

export default function FileBrowser({ gameState, setGameState }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentDir, setCurrentDir] = useState("/");
  const [decryptPassword, setDecryptPassword] = useState("");
  const [draggedFile, setDraggedFile] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(null);
  const [previewMode, setPreviewMode] = useState('text');
  const [decryptAttempts, setDecryptAttempts] = useState({});
  const queryClient = useQueryClient();

  const { data: files } = useQuery({
    queryKey: ['gamefiles'],
    queryFn: () => base44.entities.GameFile.list(),
    initialData: [],
  });

  const { data: missions } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list(),
    initialData: [],
  });

  const updateFileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GameFile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamefiles'] });
    },
  });

  const directories = [...new Set(files.map(f => f.directory))];
  const currentFiles = files.filter(f => 
    f.directory === currentDir &&
    (!f.unlock_requirement || gameState.completedMissions.includes(f.unlock_requirement))
  );

  const decryptTool = files.find(f => f.filename === 'decrypt.exe');

  const getUnlockHint = (file) => {
    if (!file.unlock_requirement) return null;
    const mission = missions.find(m => m.id === file.unlock_requirement);
    return mission ? `Complete: ${mission.title}` : 'Complete mission to unlock';
  };

  const handleDecrypt = () => {
    if (!draggedFile) return;

    const attempts = decryptAttempts[draggedFile.id] || 0;
    
    if (draggedFile.password === decryptPassword) {
      const decryptedContent = draggedFile.filename === 'ethics_report_DRAFT_Ni.txt'
        ? `CLASSIFIED ETHICS REPORT - Dr. Ni's Notes

Date: [REDACTED]

I can't sleep. They're weaponizing my life's work.

I invented miniaturization to SAVE humanity, not destroy it. The calculations were clear: we're running out of space, resources, time. But miniaturization could solve it all. Imagine - billions of people, living sustainably in a fraction of the space. No more hunger, no more resource wars.

But the board... they only see profit. Military contracts. Surveillance. Weapons delivery systems. They're turning human beings into disposable tools.

The test subjects - they call them "agents" now - they're suffering. Bio-stress levels are catastrophic. We're compressing human consciousness into bodies that can't handle the strain. 30% mortality rate and they call it "acceptable."

This isn't what I built. This isn't what science is for.

The Ark Protocol - that's the real answer. Mass miniaturization, voluntary, controlled. We could save 2 billion people from the coming collapse. But they won't fund it. "Not profitable enough," they said.

I'm locked out of my own systems now. They know I'll blow the whistle. But I've left breadcrumbs. Someone will find this. Someone will know the truth.

If you're reading this: the password is NUXELAND. The evidence is in the Comms system. Stop them. Please.

- Dr. Ni`
        : draggedFile.content;

      updateFileMutation.mutate({
        id: draggedFile.id,
        data: { 
          is_corrupted: false,
          is_encrypted: false,
          content: decryptedContent
        }
      });

      setGameState(prev => ({
        ...prev,
        decryptedFiles: [...prev.decryptedFiles, draggedFile.id]
      }));
      
      setDraggedFile(null);
      setDecryptPassword("");
      setSelectedFile(null);
      setDecryptAttempts({});
    } else {
      setDecryptAttempts(prev => ({
        ...prev,
        [draggedFile.id]: attempts + 1
      }));
    }
  };

  const playAudio = (file) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(file.content);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
      setAudioPlaying(file.id);
      utterance.onend = () => setAudioPlaying(null);
    }
  };

  const isDecrypted = selectedFile && gameState.decryptedFiles.includes(selectedFile.id);

  const getFileIcon = (type) => {
    switch(type) {
      case 'txt': case 'pdf': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'wav': return <Volume2 className="w-5 h-5 text-purple-400" />;
      case 'img': return <Image className="w-5 h-5 text-green-400" />;
      case 'exe': return <File className="w-5 h-5 text-red-400" />;
      default: return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const renderFilePreview = (file) => {
    if (file.is_encrypted && !isDecrypted) {
      return (
        <div className="space-y-4">
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 text-center">
            <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-3 animate-pulse" />
            <p className="text-yellow-300 text-lg font-mono font-bold mb-2">ENCRYPTED FILE</p>
            <p className="text-gray-400 text-sm font-mono mb-4">
              This file is protected. Drag it to the decrypt tool to unlock.
            </p>
            {file.password && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3 mt-4">
                <Key className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-blue-400 text-xs font-mono">Password hint: {getUnlockHint(file) || 'Find clues in missions'}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (file.is_corrupted && !isDecrypted) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3 animate-pulse" />
          <p className="text-red-300 text-lg font-mono font-bold mb-2">CORRUPTED DATA</p>
          <div className="bg-black/50 rounded p-4 font-mono text-xs text-red-500 space-y-1">
            <p>§§§ DATA UNREADABLE §§§</p>
            <p>▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓</p>
            <p>ERROR: 0x4E495845</p>
            <p className="text-yellow-500 mt-2">Use decrypt.exe to recover</p>
          </div>
        </div>
      );
    }

    // Preview based on file type
    switch(file.file_type) {
      case 'txt':
      case 'pdf':
        return (
          <div className="space-y-3">
            <div className="flex gap-2 mb-3">
              <Button
                onClick={() => setPreviewMode('text')}
                variant={previewMode === 'text' ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                Text
              </Button>
            </div>
            <div className="bg-[#0F1729] rounded-lg p-4 border border-gray-700 max-h-[400px] overflow-y-auto">
              <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                {file.content}
              </pre>
            </div>
          </div>
        );

      case 'wav':
        return (
          <div className="space-y-3">
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 text-center">
              <Volume2 className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-purple-300 font-mono text-sm mb-4">Audio Transcript:</p>
              <div className="bg-black/30 rounded p-4 mb-4 max-h-48 overflow-y-auto">
                <p className="text-gray-300 text-sm font-mono text-left">{file.content}</p>
              </div>
              <Button
                onClick={() => playAudio(file)}
                disabled={audioPlaying === file.id}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {audioPlaying === file.id ? 'Playing...' : 'Play Audio'}
              </Button>
            </div>
          </div>
        );

      case 'img':
        return (
          <div className="space-y-3">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center">
              <Image className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-green-300 font-mono text-sm mb-3">Image Data:</p>
              <div className="bg-black/30 rounded p-4">
                <p className="text-gray-400 text-xs font-mono">{file.content}</p>
              </div>
            </div>
          </div>
        );

      case 'exe':
        return (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
            <File className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-300 font-mono text-sm mb-2">EXECUTABLE FILE</p>
            <p className="text-gray-400 text-xs font-mono">{file.content}</p>
          </div>
        );

      default:
        return (
          <div className="bg-gray-900/20 border border-gray-700 rounded-lg p-4">
            <pre className="text-gray-400 text-sm font-mono whitespace-pre-wrap">
              {file.content}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4 p-6">
      {/* Directory Tree */}
      <div className="bg-[#0A0E1A] rounded-lg border border-gray-700 p-4">
        <h3 className="text-white font-mono font-bold mb-4 flex items-center gap-2">
          <Folder className="w-5 h-5 text-yellow-400" />
          DIRECTORIES
        </h3>
        <div className="space-y-2">
          {directories.map(dir => (
            <button
              key={dir}
              onClick={() => setCurrentDir(dir)}
              className={`w-full text-left px-3 py-2 rounded font-mono text-sm transition-colors ${
                currentDir === dir 
                  ? 'bg-blue-900/30 text-blue-400 border border-blue-500/50'
                  : 'text-gray-400 hover:bg-gray-800 border border-transparent'
              }`}
            >
              {dir}
            </button>
          ))}
        </div>

        {/* Decrypt Tool */}
        {currentDir === 'SYSTEM/' && decryptTool && (
          <div 
            className="mt-6 bg-red-900/20 border-2 border-red-500/50 rounded-lg p-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
            }}
          >
            <h4 className="text-red-400 font-mono font-bold text-sm mb-3 flex items-center gap-2">
              {getFileIcon('exe')}
              {decryptTool.filename}
            </h4>
            <p className="text-gray-400 font-mono text-xs mb-3">
              Drag encrypted files here
            </p>
            {draggedFile && (
              <div className="space-y-3">
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
                  <p className="text-yellow-300 font-mono text-xs flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    {draggedFile.filename}
                  </p>
                </div>
                {decryptAttempts[draggedFile.id] > 0 && (
                  <div className="bg-red-900/30 border border-red-500/30 rounded p-2">
                    <p className="text-red-400 text-xs font-mono flex items-center gap-2">
                      <X className="w-3 h-3" />
                      Failed: {decryptAttempts[draggedFile.id]} attempt(s)
                    </p>
                  </div>
                )}
                <Input
                  type="password"
                  placeholder="Enter password..."
                  value={decryptPassword}
                  onChange={(e) => setDecryptPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDecrypt()}
                  className="bg-[#0F1729] border-gray-700 text-white font-mono text-sm"
                />
                <Button
                  onClick={handleDecrypt}
                  className="w-full bg-red-600 hover:bg-red-700 font-mono text-sm"
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  DECRYPT
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Decryption Stats */}
        {gameState.decryptedFiles.length > 0 && (
          <div className="mt-4 bg-green-900/20 border border-green-500/30 rounded-lg p-3">
            <p className="text-green-400 font-mono text-xs flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4" />
              FILES DECRYPTED
            </p>
            <Badge className="bg-green-500/20 text-green-400 font-mono">
              {gameState.decryptedFiles.length}
            </Badge>
          </div>
        )}
      </div>

      {/* File List */}
      <div className="bg-[#0A0E1A] rounded-lg border border-gray-700 p-4">
        <h3 className="text-white font-mono font-bold mb-4">
          FILES: {currentDir}
        </h3>
        <div className="space-y-2">
          {currentFiles.map(file => (
            <button
              key={file.id}
              draggable={file.is_encrypted || file.is_corrupted}
              onDragStart={() => setDraggedFile(file)}
              onClick={() => setSelectedFile(file)}
              className={`w-full text-left px-3 py-2 rounded font-mono text-sm flex items-center gap-3 transition-colors ${
                selectedFile?.id === file.id
                  ? 'bg-purple-900/30 border border-purple-500/50'
                  : 'hover:bg-gray-800 border border-transparent'
              } ${file.is_encrypted || file.is_corrupted ? 'cursor-move' : ''}`}
            >
              {getFileIcon(file.file_type)}
              <span className={`flex-1 truncate ${
                file.is_corrupted ? 'text-red-400' :
                file.is_encrypted ? 'text-yellow-400' :
                gameState.decryptedFiles.includes(file.id) ? 'text-green-400' :
                'text-white'
              }`}>
                {file.filename}
              </span>
              {file.is_encrypted && !gameState.decryptedFiles.includes(file.id) && (
                <Lock className="w-4 h-4 text-yellow-400" />
              )}
              {file.is_corrupted && !gameState.decryptedFiles.includes(file.id) && (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              {gameState.decryptedFiles.includes(file.id) && (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
            </button>
          ))}
          {currentFiles.length === 0 && (
            <p className="text-gray-500 font-mono text-sm text-center py-8">
              No accessible files
            </p>
          )}
        </div>
      </div>

      {/* File Viewer */}
      <div className="bg-[#0A0E1A] rounded-lg border border-gray-700 p-4">
        <h3 className="text-white font-mono font-bold mb-4 flex items-center justify-between">
          FILE VIEWER
          {selectedFile && gameState.decryptedFiles.includes(selectedFile.id) && (
            <Badge className="bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Decrypted
            </Badge>
          )}
        </h3>
        {selectedFile ? (
          <div className="space-y-4">
            <div className="border-b border-gray-700 pb-3">
              <div className="flex items-center gap-2 mb-1">
                {getFileIcon(selectedFile.file_type)}
                <p className="text-white font-mono text-lg flex-1 truncate">{selectedFile.filename}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="outline" className="text-xs font-mono">
                  {selectedFile.file_type.toUpperCase()}
                </Badge>
                {selectedFile.is_encrypted && !isDecrypted && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                    Encrypted
                  </Badge>
                )}
                {selectedFile.is_corrupted && !isDecrypted && (
                  <Badge className="bg-red-500/20 text-red-400 text-xs">
                    Corrupted
                  </Badge>
                )}
              </div>
            </div>

            {renderFilePreview(selectedFile)}
          </div>
        ) : (
          <div className="text-center py-12">
            <File className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 font-mono text-sm">Select a file to view</p>
          </div>
        )}
      </div>
    </div>
  );
}