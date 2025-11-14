import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { File, Folder, Lock, AlertCircle, Volume2, Image, FileText } from "lucide-react";

export default function FileBrowser({ gameState, setGameState }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentDir, setCurrentDir] = useState("/");
  const [decryptPassword, setDecryptPassword] = useState("");
  const [draggedFile, setDraggedFile] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(null);
  const queryClient = useQueryClient();

  const { data: files } = useQuery({
    queryKey: ['gamefiles'],
    queryFn: () => base44.entities.GameFile.list(),
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

  const handleDecrypt = () => {
    if (draggedFile && draggedFile.password === decryptPassword) {
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
              // File already set from drag start
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
              <div className="space-y-2">
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-2">
                  <p className="text-yellow-300 font-mono text-xs">
                    File: {draggedFile.filename}
                  </p>
                </div>
                <Input
                  type="password"
                  placeholder="Enter password..."
                  value={decryptPassword}
                  onChange={(e) => setDecryptPassword(e.target.value)}
                  className="bg-[#0F1729] border-gray-700 text-white font-mono text-sm"
                />
                <Button
                  onClick={handleDecrypt}
                  className="w-full bg-red-600 hover:bg-red-700 font-mono text-sm"
                >
                  DECRYPT
                </Button>
              </div>
            )}
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
              <span className={`flex-1 ${
                file.is_corrupted ? 'text-red-400' :
                file.is_encrypted ? 'text-yellow-400' :
                'text-white'
              }`}>
                {file.filename}
              </span>
              {file.is_encrypted && <Lock className="w-4 h-4 text-yellow-400" />}
              {file.is_corrupted && <AlertCircle className="w-4 h-4 text-red-400" />}
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
        <h3 className="text-white font-mono font-bold mb-4">FILE VIEWER</h3>
        {selectedFile ? (
          <div className="space-y-4">
            <div className="border-b border-gray-700 pb-3">
              <p className="text-white font-mono text-lg">{selectedFile.filename}</p>
              <p className="text-gray-500 font-mono text-xs">{selectedFile.file_type.toUpperCase()}</p>
            </div>

            {selectedFile.is_encrypted && !isDecrypted ? (
              <div className="space-y-3">
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
                  <Lock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-yellow-300 text-sm font-mono text-center">
                    FILE ENCRYPTED - Drag to decrypt.exe
                  </p>
                </div>
              </div>
            ) : selectedFile.is_corrupted && !isDecrypted ? (
              <div className="bg-red-900/20 border border-red-500/30 rounded p-4">
                <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-red-300 text-sm font-mono text-center mb-3">
                  FILE CORRUPTED - Drag to decrypt.exe
                </p>
                <p className="text-gray-400 text-xs font-mono">
                  §§§ DATA UNREADABLE §§§<br/>
                  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓<br/>
                  ERROR: 0x4E495845
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-[#0F1729] rounded p-4 border border-gray-700 max-h-[400px] overflow-y-auto">
                  <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
                    {selectedFile.content}
                  </pre>
                </div>
                {selectedFile.file_type === 'wav' && (
                  <Button
                    onClick={() => playAudio(selectedFile)}
                    disabled={audioPlaying === selectedFile.id}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {audioPlaying === selectedFile.id ? 'Playing...' : 'Play Audio'}
                  </Button>
                )}
              </div>
            )}
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