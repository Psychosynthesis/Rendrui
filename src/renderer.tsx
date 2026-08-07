import { useState, type ReactNode } from 'react';
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
  onSelect?: (id: any) => void;
  customRenderers?: CustomRenderer[];
  className?: string;
  foldLevel?: number;
}

const isColor = (str: string) => {
  // HEX проверка: #RGB или #RRGGBB
  if (/^#([\da-f]{3}|[\da-f]{6})$/i.test(str)) return true;
  // RGB/RGBA проверка (без процентов)
  return str.match(/^rgba?\(\s*(\d{1,3})(\s*,\s*(\d{1,3}))(\s*,\s*(\d{1,3}))(\s*,\s*[\d.]+)?\s*\)$/i);
}

const getPathParts = (path: string) => {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);
};

const setValueByPath = (obj: any, path: string, value: any) => {
  if (!path) return value;

  const parts = getPathParts(path);
  let target = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    target = target[parts[i]];
  }

  target[parts[parts.length - 1]] = value;

  return obj;
};

const FoldableValue = ({ preview, renderContent }: {
  preview: string;
  renderContent: () => ReactNode;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="foldable-value">
      <button
        type="button"
        className="fold-toggle"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((value) => !value)}
      >
        {isExpanded ? '▼' : '▶'}
      </button>

      {isExpanded
        ? renderContent()
        : <span className="type-label">{preview}</span>
      }
    </div>
  );
};

const validateFoldLevel = (foldLevel: number) => {
  if (!Number.isInteger(foldLevel) || foldLevel < 0) {
    console.warn('[Rendrui] foldLevel must be a non-negative integer. Falling back to 0.');
    return 0;
  }

  return foldLevel;
};

const RenderField = ({ value, path, onEdit }: {
  value: any;
  path: string;
  onEdit?: (path: string, newValue: any) => void;
}) => {
  const [inputValue, setInputValue] = useState<string | null>(null);
  const isEditing = inputValue !== null;
  const isEditAvailable = typeof onEdit === 'function';
  const serializedValue = JSON.stringify(value);
  const valueIsColor = typeof value === 'string' && isColor(value);
  const styleColor = valueIsColor ? { color: value } : {};

  const handleSave = () => {
    if (inputValue === null) return;

    try {
      const parsedValue = JSON.parse(inputValue);
      onEdit?.(path, parsedValue);
      setInputValue(null);
    } catch (e) {
      console.error('Error on saving. Invalid JSON?');
    }
  };

  return isEditing ? (
    <div className="edit-field">
      <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} autoFocus />
      <button type="button" className="button-ok" onClick={handleSave}>✓</button>
      <button type="button" className="button-esc" onClick={() => setInputValue(null)}>✕</button>
    </div>
  ) : (
    <span
      className={isEditAvailable ? "editable-value" : "value-text"}
      onClick={() =>
        isEditAvailable &&
        setInputValue(serializedValue ?? '')
      }
      style={styleColor}
    >
      {serializedValue}
    </span>
  );
};

const renderObject = (
  obj: any,
  onEdit?: (path: string, newValue: any) => void,
  layer: number = 0,
  pathPrefix: string = '',
  customRenderers?: CustomRenderer[],
  foldLevel: number = 0,
  allowFold: boolean = true
): ReactNode => {
  const itemType = Array.isArray(obj) ? 'array' : typeof obj;
  const isArray = (itemType === 'array');
  const isObject = itemType === 'object' && obj !== null;

  if (allowFold && foldLevel > 0 && layer > foldLevel && (isArray || isObject)) {
    return (
      <FoldableValue
        preview={isArray ? '[…]' : '{…}'}
        renderContent={() =>
          renderObject(
            obj,
            onEdit,
            layer,
            pathPrefix,
            customRenderers,
            foldLevel,
            false
          )
        }
      />
    );
  }

  if (customRenderers) {
    for (const renderer of customRenderers) {
      if (renderer.match(obj, pathPrefix)) {
        return renderer.render({
          value: obj,
          path: pathPrefix,
          onEdit
        });
      }
    }
  }

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
            <div
              className="array-item"
              key={currentPath}
              style={{ paddingLeft }}
            >
              {renderObject(
                item,
                onEdit,
                layer + 1,
                currentPath,
                customRenderers,
                foldLevel
              )}
            </div>
          );
        })} ]

        {onEdit &&
          <div className="array-controls">
            <span className="type-label"> ({itemType}) </span>

            <button type="button" onClick={onArrayEdit}>
              {(obj.length === 0)
                ? '+ Добавить первый элемент'
                : 'Добавить элемент'
              }
            </button>
          </div>
        }
      </div>
    );
  }

  if (isObject) {
    return Object.keys(obj).map((key) => {
      const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
      const paddingLeft = layer === 0 ? '10px' : `${layer * 20}px`
      const hasNestedObject =
        obj[key] !== null &&
        typeof obj[key] === 'object';

      const rowClass = hasNestedObject
        ? 'object-row has-nested-object'
        : 'object-row';

      return (
        <div
          className={rowClass}
          key={currentPath}
          style={{ paddingLeft }}
        >
          <div className="key-cell">{key}:</div>

          {renderObject(
            obj[key],
            onEdit,
            layer + 1,
            currentPath,
            customRenderers,
            foldLevel
          )}
        </div>
      );
    });
  }

  return (
    <div className={cellClass}>
      <RenderField
        value={obj}
        path={pathPrefix}
        onEdit={onEdit}
      />

      <span className="type-label"> ({itemType})</span>
    </div>
  );
};

export const ObjectRenderer = ({
  dataToRender,
  header,
  onEdit,
  customRenderers,
  className,
  foldLevel = 0
}: ObjectRendererProps) => {
  const safeFoldLevel = validateFoldLevel(foldLevel);

  const handleFieldEdit = (path: string, newValue: any) => {
    const updatedObj = setValueByPath(
      JSON.parse(JSON.stringify(dataToRender)),
      path,
      newValue
    );

    onEdit?.({ updated_src: updatedObj });
  };

  return (
    <div className={className ? "object-renderer " + className : "object-renderer"}>
      {header && <h3>{header}</h3>}

      {renderObject(dataToRender, onEdit && handleFieldEdit, 0, '', customRenderers, safeFoldLevel)}
    </div>
  );
};
