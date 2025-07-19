import React, { useState } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

import type { JsonSchema, SchemaData, SchemaField as FieldType } from '@/types/schema';
import { SchemaField } from './SchemaField';

const generateUniqueId = () => Math.random().toString(36).substring(2, 10);

export const JsonSchemaBuilder: React.FC = () => {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const form = useForm<SchemaData>({
    defaultValues: {
      fields: [
        {
          id: generateUniqueId(),
          key: '',
          type: 'String',
          defaultValue: '',
        },
      ],
    },
  });

  const { control, watch } = form;
  const { fields: formFields, append, remove } = useFieldArray({
    control,
    name: 'fields',
  });

  const schemaValues = watch();

  const handleAddField = () => {
    append({
      id: generateUniqueId(),
      key: 'newField',
      type: 'String',
      defaultValue: '',
    });
  };

  const handleRemoveField = (index: number) => remove(index);

  const buildSchemaObject = (fieldList: FieldType[]): JsonSchema => {
    const schema: JsonSchema = {};

    fieldList.forEach((item) => {
      if (!item.key?.trim()) return;

      switch (item.type) {
        case 'String':
          schema[item.key] = item.defaultValue ?? '';
          break;
        case 'Number':
          schema[item.key] = item.defaultValue ?? 0;
          break;
        case 'Nested':
          if (item.fields) {
            schema[item.key] = buildSchemaObject(item.fields);
          }
          break;
      }
    });

    return schema;
  };

  const generatedJson = buildSchemaObject(schemaValues.fields || []);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(generatedJson, null, 2));
      setCopiedToClipboard(true);
      toast.success('JSON copied to clipboard!');
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
        console.log(error)
      toast.error('Unable to copy JSON');
    }
  };

  return (
    <FormProvider {...form}>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">JSON Schema Designer</h1>
          <p className="text-gray-600">
              Create your JSON schema step by step, with easy nesting and type selection.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Field Builder */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Field Configuration</CardTitle>
                <Button onClick={handleAddField} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Field
                </Button>
              </div>
            </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
  <div className="space-y-4">
                {formFields.map((fieldItem, idx) => (
                  <SchemaField
                    key={fieldItem.id}
                    path={`fields.${idx}`}
                    data={fieldItem}
                    onDelete={() => handleRemoveField(idx)}
                    showDelete={formFields.length > 1}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right: Schema Output */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated JSON</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJson}
                  className="flex items-center gap-2"
                >
                  {copiedToClipboard ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy JSON
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent >
              <pre className="bg-gray-50 p-4 rounded-lg text-sm max-h-[400px] overflow-y-auto border">
                {JSON.stringify(generatedJson, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </FormProvider>
  );
};
