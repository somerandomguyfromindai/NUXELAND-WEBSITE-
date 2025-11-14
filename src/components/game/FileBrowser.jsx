import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { File, Folder, Lock, AlertCircle, Volume2, Image, FileText } from "lucide-react";

export default function FileBrowser({ gameState, setGameState }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentDir, setCurrentDir] = useState("/");
  const [decryptPassword, setDecryptPassword] = useState("");

  const { data: files } = useQuery({
    queryKey: ['gamefiles'],
    queryFn: () => base44.entities.GameFile.list(),
    initialData: [],
  });

  const directories = [...new Set(files.map(f => f.directory))];
  const currentFiles = files.filter(f => 
    f.directory === currentDir &&
    (!f.unlock_requirement || gameState.completedMissions.includes(f.unlock_requirement))
  );

  const handleDecrypt = () => {
    if (selectedFile && selectedFile.password === decryptPassword) {
      setGameState(prev => ({
        ...prev,
        decryptedFiles: [...prev.decryptedFiles, selectedFile.id]
      }));
      setDecryptPassword("");
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
              onClick={() => setSelectedFile(file)}
              className={`w-full text-left px-3 py-2 rounded font-mono text-sm flex items-center gap-3 transition-colors ${
                selectedFile?.id === file.id
                  ? 'bg-purple-900/30 border border-purple-500/50'
                  : 'hover:bg-gray-800 border border-transparent'
              }`}
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
                    FILE ENCRYPTED
                  </p>
                </div>
                <Input
                  type="password"
                  placeholder="Enter password..."
                  value={decryptPassword}
                  onChange={(e) => setDecryptPassword(e.target.value)}
                  className="bg-[#0F1729] border-gray-700 text-white font-mono"
                />
                <Button
                  onClick={handleDecrypt}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 font-mono"
                >
                  DECRYPT
                </Button>
              </div>
            ) : selectedFile.is_corrupted ? (
              <div className="bg-red-900/20 border border-red-500/30 rounded p-4">
                <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-red-300 text-sm font-mono text-center mb-3">
                  FILE CORRUPTED
                </p>
                <p className="text-gray-400 text-xs font-mono">
                  §§§ DATA UNREADABLE §§§<br/>
                  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓<br/>
                  ERROR: 0x4E495845
                </p>
              </div>
            ) : (
              <div className="bg-[#0F1729] rounded p-4 border border-gray-700">
                <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
                  {selectedFile.content}
                </pre>
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