import { useState, useEffect, type ReactNode } from 'react';
import './style.css';

export interface CustomRenderer {
  match: (value: any, path: string) => boolean;
  render: (props: {
    value: any;
    path: string;
    onEdit?: (path: string, newValue: any) => void;
  }) => ReactNode;
}

export interface ObjectRendererProps {
  header?: ReactNode;
  dataToRender: any;
  onEdit?: (editData: { updated_src: any }) => void;
  autoCollapse?: boolean;
  onSelect?: (id: any) => void;
  customRenderers?: CustomRenderer[];
  className?: string;
}

const isColor = (str: string) => {
  // HEX проверка: #RGB или #RRGGBB
  if (/^#([\da-f]{3}|[\da-f]{6})$/i.test(str)) return true;
  // RGB/RGBA проверка (без процентов)
  return str.match(/^rgba?\(\s*(\d{1,3})(\s*,\s*(\d{1,3}))(\s*,\s*(\d{1,3}))(\s*,\s*[\d.]+)?\s*\)$/i);
}

const getValueByPath = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
};

const setValueByPath = (obj: any, path: string, value: any) => {
  const arrayMatch = path.match(/(.*)\[(\d+)\]/);
  if (arrayMatch) {
    const [, basePath, index] = arrayMatch;
    const arr = getValueByPath(obj, basePath);
    arr[Number(index)] = value;
    return;
  }

  const parts = path.split('.');
  let updatedObj = { ...obj };
  for (let i = 0; i < parts.length - 1; i++) {
    updatedObj = updatedObj[parts[i]];
  }
  updatedObj[parts[parts.length - 1]] = value;
  return updatedObj;
};

const RenderField = ({ value, path, onEdit }: {
  value: any;
  path: string;
  onEdit?: (path: string, newValue: any) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(JSON.stringify(value));
  const isEditAvailable = typeof onEdit === 'function';
  const valueIsColor = typeof value === 'string' && isColor(value);
  const styleColor = valueIsColor ? { color: value } : {};

  const handleSave = () => {
    try {
      const parsedValue = JSON.parse(inputValue);
      onEdit?.(path, parsedValue);
      setIsEditing(false);
    } catch (e) {
      console.error('Error on saving. Invalid JSON?');
    }
  };

  useEffect(() => setInputValue(JSON.stringify(value)), [value]);

  return isEditing ? (
    <div className="edit-field">
      <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} autoFocus />
      <button className="button-ok" onClick={handleSave}>✓</button>
      <button className="button-esc" onClick={() => setIsEditing(false)}>✕</button>
    </div>
  ) : (
    <span
      className={isEditAvailable? "editable-value" : "value-text" }
      onClick={() => isEditAvailable && setIsEditing(true)}
      style={styleColor}
    >
      {JSON.stringify(value)}
    </span>
  );
};

const renderObject = (
  obj: any,
  onEdit?: (path: string, newValue: any) => void,
  layer: number = 0,
  pathPrefix: string = '',
  customRenderers?: CustomRenderer[]
): ReactNode => {
  if (customRenderers) {
    for (const renderer of customRenderers) {
      if (renderer.match(obj, pathPrefix)) {
        return renderer.render({ value: obj, path: pathPrefix, onEdit });
      }
    }
  }
  const itemType = Array.isArray(obj) ? 'array' : typeof obj;
  const isArray = (itemType === 'array');
  const cellClass = onEdit ? 'value-cell-editable' : 'value-cell';
  const onArrayEdit = () => {
    if (onEdit) {
      if (isArray && obj.length === 0) {
        onEdit(pathPrefix, [{}]);
      } else {
        onEdit(pathPrefix, [...obj, {}]);
      }
    }
  };

  // console.log('detected type: ', itemType, '\n');

  if (isArray) {
    return (
      <div className="array-block">
        <span className="type-label">array: </span>
        [ {obj.map((item: any, index: number) => {
          const currentPath = `${pathPrefix}[${index}]`;
          const paddingLeft = `${layer * 20}px`;
          return (
            <div className="array-item" key={currentPath} style={{ paddingLeft }}>
              {renderObject(item, onEdit, layer + 1, currentPath, customRenderers)}
            </div>
          );
        })} ]
        {onEdit &&
          <div className="array-controls">
            <span className="type-label"> ({itemType}) </span>
            <button onClick={onArrayEdit}>
              {(obj.length === 0) ? '+ Добавить первый элемент' : 'Добавить элемент' }
            </button>
          </div>
        }
      </div>
    );
  }

  if (itemType === 'object' && obj !== null) {
    return Object.keys(obj).map((key) => {
      const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
      const paddingLeft = layer === 0 ? '10px' : `${layer * 20}px`
      const rowClass = typeof obj[key] === 'object' ? 'object-row has-nested-object' : 'object-row';
      return (
        <div className={rowClass} key={currentPath} style={{ paddingLeft }}>
          <div className="key-cell">{key}:</div>
          {renderObject(obj[key], onEdit, layer + 1, currentPath, customRenderers)}
        </div>
      );
    });
  }

  return (
    <div className={cellClass}>
      <RenderField value={obj} path={pathPrefix} onEdit={onEdit} />
      <span className="type-label"> ({itemType})</span>
    </div>
  );
};

export const ObjectRenderer = ({ dataToRender, header, onEdit, customRenderers, className }: ObjectRendererProps) => {
  const handleFieldEdit = (path: string, newValue: any) => {
    const updatedObj = setValueByPath(JSON.parse(JSON.stringify(dataToRender)), path, newValue);
    onEdit?.({ updated_src: updatedObj });
  };

  return (
    <div className={className ? "object-renderer " + className : "object-renderer"}>
      <h3>{header}</h3>
      {renderObject(dataToRender, onEdit && handleFieldEdit, 0, '', customRenderers)}
    </div>
  );
};
