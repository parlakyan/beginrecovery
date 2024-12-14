import React from 'react';
import { Archive, ShieldCheck, ShieldAlert, Trash2 } from 'lucide-react';
import { Button } from './ui';

interface BatchActionsProps {
  selectedCount: number;
  showArchived: boolean;
  onVerify: () => void;
  onUnverify: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const BatchActions: React.FC<BatchActionsProps> = ({
  selectedCount,
  showArchived,
  onVerify,
  onUnverify,
  onArchive,
  onDelete
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
      <span className="text-blue-700 font-medium">
        {selectedCount} {selectedCount === 1 ? 'facility' : 'facilities'} selected
      </span>
      <div className="flex gap-2">
        {!showArchived && (
          <>
            <Button
              variant="secondary"
              onClick={onVerify}
              className="text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              Verify
            </Button>
            <Button
              variant="secondary"
              onClick={onUnverify}
              className="text-sm"
            >
              <ShieldAlert className="w-4 h-4" />
              Unverify
            </Button>
            <Button
              variant="secondary"
              onClick={onArchive}
              className="text-sm"
            >
              <Archive className="w-4 h-4" />
              Archive
            </Button>
          </>
        )}
        {showArchived && (
          <Button
            variant="secondary"
            onClick={onDelete}
            className="text-sm bg-red-50 text-red-700 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};
