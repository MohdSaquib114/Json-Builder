import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import type { SchemaField as FieldType } from '@/types/schema';

interface Props {
  nestLevel?: number;
  path: string;
  data: FieldType;
  onDelete: () => void;
  showDelete?: boolean;
}

const generateUniqueId = () => Math.random().toString(36).substring(2, 10);

export const SchemaField: React.FC<Props> = ({
  nestLevel = 0,
  path,
  onDelete,
  showDelete = true,
}) => {
  const { register, watch, setValue } = useFormContext();
  const selectedType = watch(`${path}.type`);

  const {
    fields: childFields,
    append,
    remove,
  } = useFieldArray({ name: `${path}.fields` });

  const handleTypeChange = (type: string) => {
    setValue(`${path}.type`, type);

    if (type === 'String') {
      setValue(`${path}.defaultValue`, '');
      setValue(`${path}.fields`, undefined);
    } else if (type === 'Number') {
      setValue(`${path}.defaultValue`, 0);
      setValue(`${path}.fields`, undefined);
    } else if (type === 'Nested') {
      setValue(`${path}.defaultValue`, undefined);
      if (!childFields || childFields.length === 0) {
        setValue(`${path}.fields`, []);
      }
    }
  };

  const handleAddNested = () => {
    append({
      id: generateUniqueId(),
      key: 'nestedField',
      type: 'String',
      defaultValue: '',
    });
  };

  const handleRemoveNested = (index: number) => {
    remove(index);
  };

  return (
    <Card
      className={`mb-4 ${
        nestLevel > 0 ? 'ml-6 border-l-4 border-blue-200 pl-4' : ''
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              placeholder="Field name"
              {...register(`${path}.key`)}
              className="font-medium"
            />

            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="String">String</SelectItem>
                <SelectItem value="Number">Number</SelectItem>
                <SelectItem value="Nested">Nested</SelectItem>
              </SelectContent>
            </Select>

            {(selectedType === 'String' || selectedType === 'Number') && (
              <Input
                type={selectedType === 'Number' ? 'number' : 'text'}
                placeholder="Default value"
                {...register(`${path}.defaultValue`, {
                  valueAsNumber: selectedType === 'Number',
                })}
              />
            )}

            {selectedType === 'Nested' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNested}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Nested Field
              </Button>
            )}
          </div>

          {showDelete && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {selectedType === 'Nested' && childFields.length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {childFields.map((child, idx) => (
              <SchemaField
                key={child.id}
                nestLevel={nestLevel + 1}
                path={`${path}.fields.${idx}`}
                data={child as FieldType}
                onDelete={() => handleRemoveNested(idx)}
                showDelete={true}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
