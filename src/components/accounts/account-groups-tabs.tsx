'use client';

import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateGroupDialog } from './create-group-dialog';
import { EditGroupDialog } from './edit-group-dialog';

interface Account {
  id: number;
  name: string;
  currency: string;
  isCredit: boolean | null;
}

interface Group {
  id: number;
  name: string;
  includeInTotal: boolean;
  accounts: Account[];
}

interface AccountGroupsTabsProps {
  groups: Group[];
  allAccounts: Account[];
  activeGroup: number | null;
  onGroupChange: (groupId: number | null) => void;
}

export function AccountGroupsTabs({ groups, allAccounts, activeGroup, onGroupChange }: AccountGroupsTabsProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);

  const handleGroupClick = (groupId: number | null) => {
    onGroupChange(groupId);
  };

  const handleGroupRightClick = (e: React.MouseEvent, group: Group) => {
    e.preventDefault();
    setEditGroup(group);
  };

  return (
    <>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => handleGroupClick(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeGroup === null
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Todas
        </button>
        
        {groups.map((group) => (
          <div key={group.id} className="relative group">
            <button
              onClick={() => handleGroupClick(group.id)}
              onContextMenu={(e) => handleGroupRightClick(e, group)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors pr-10 ${
                activeGroup === group.id
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 opacity-100'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {group.name}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditGroup(group);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-transform hover:scale-150 hover:cursor-pointer"
              title="Editar grupo"
            >
              <Pencil className={`w-3 h-3 ${activeGroup === group.id ? 'text-white dark:text-slate-900' : 'text-slate-500'}`}/>
            </button>
          </div>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCreateDialogOpen(true)}
          className="rounded-full px-3 dark:hover:bg-slate-500"
        >
          <Plus className="w-4 h-4"/>
        </Button>
      </div>

      <CreateGroupDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      
      {editGroup && (
        <EditGroupDialog
          key={editGroup.id}
          group={editGroup}
          allAccounts={allAccounts}
          open={!!editGroup}
          onOpenChange={(open) => !open && setEditGroup(null)}
        />
      )}
    </>
  );
}
