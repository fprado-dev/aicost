'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { useModels } from '@/hooks/use-models';
import { CreateModelParams } from '@/lib/supabase/model.service';
import { useState } from 'react';
import { ModelCard } from './components/model-card';
import { ModelFilter } from './components/model-filter';
import { ModelForm } from './components/model-form';
import { ModelSkeleton } from './components/model-skeleton';

export default function ModelsPage() {
  const { defaultModels, loading, createModel, updateModel, deleteModel } = useModels();
  const { isPending: isCreating } = useModels().createModelMutation;
  const { isPending: isUpdating } = useModels().updateModelMutation;
  const { isPending: isDeleting } = useModels().deleteModelMutation;

  const [newModel, setNewModel] = useState<CreateModelParams>({ model_name: '', model_type: 'text', is_public: false });
  const [editingModel, setEditingModel] = useState<{ id?: string; } & CreateModelParams>({ id: '', model_name: '', model_type: 'text', is_public: false });
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);


  const filteredDefaultModels = defaultModels.filter(model => {
    const matchesSearch = model.model_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(model.model_type);
    return matchesSearch && matchesType;
  });

  const handleCreateModel = async () => {
    if (!newModel.model_name.trim()) return;
    try {
      await createModel(newModel);
      setNewModel({ model_name: '', model_type: 'text', is_public: false });
      setIsCreateSheetOpen(false);
    } catch (error) {
      console.error('Failed to create model:', error);
    }
  };

  const handleUpdateModel = async () => {
    if (!editingModel.model_name.trim()) return;
    try {
      const { id, ...modelData } = editingModel;
      if (id) {
        await updateModel({ id, ...modelData });
      }
      setEditingModel({ id: '', model_name: '', model_type: 'text', is_public: false });
      setIsEditSheetOpen(false);
    } catch (error) {
      console.error('Failed to update model:', error);
    }
  };

  return (
    <div className="w-full p-8">
      <div className="space-y-2 mb-4">
        <h1 className="text-3xl font-bold">AI Models</h1>
        <p className="text-muted-foreground">Manage and customize your AI models for cost tracking.</p>

      </div>
      <Card className="shadow-none border-none rounded-sm">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-4">
              <ModelFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedTypes={selectedTypes}
                onTypeChange={setSelectedTypes}
              />

              <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
                <SheetTrigger asChild>
                  <Button>New Model</Button>
                </SheetTrigger>
                <ModelForm
                  model={newModel}
                  onSubmit={handleCreateModel}
                  onModelChange={setNewModel}
                  isLoading={isCreating}
                  mode="create"
                />
              </Sheet>
            </div>
          </div>
        </div>
        <Separator className='my-5 max-w-20' />
        {loading ? (
          <div className="space-y-8">
            <ModelSkeleton title="Custom Models" />
            <ModelSkeleton title="Default Models" />
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Custom Models</h2>
              {filteredDefaultModels.filter(model => model.is_custom).length === 0 ? (
                <div className="flex items-center justify-center min-h-60 py-8 bg-sidebar rounded-lg">
                  <p className="text-muted-foreground">No custom models available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredDefaultModels.filter(model => model.is_custom).map((model) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      onEdit={(model) => {
                        setEditingModel(model);
                        setIsEditSheetOpen(true);
                      }}
                      onDelete={deleteModel}
                      isDeleting={isDeleting}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Our Models</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDefaultModels.filter(model => !model.is_custom).map((model) => (
                  <ModelCard
                    key={model.id}
                    isDefault
                    model={model}
                    onEdit={() => { }}
                    onDelete={() => { }}
                    isDeleting={false}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <ModelForm
          model={editingModel}
          onSubmit={handleUpdateModel}
          onModelChange={setEditingModel}
          isLoading={isUpdating}
          mode="edit"
        />
      </Sheet>
    </div>
  );
}