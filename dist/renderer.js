import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import './style.css';
const isColor = (str) => {
    if (/^#([\da-f]{3}|[\da-f]{6})$/i.test(str))
        return true;
    return str.match(/^rgba?\(\s*(\d{1,3})(\s*,\s*(\d{1,3}))(\s*,\s*(\d{1,3}))(\s*,\s*[\d.]+)?\s*\)$/i);
};
const getPathParts = (path) => {
    return path
        .replace(/\[(\d+)\]/g, '.$1')
        .split('.')
        .filter(Boolean);
};
const setValueByPath = (obj, path, value) => {
    if (!path)
        return value;
    const parts = getPathParts(path);
    let target = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        target = target[parts[i]];
    }
    target[parts[parts.length - 1]] = value;
    return obj;
};
const FoldableValue = ({ preview, renderContent }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (_jsxs("div", { className: "foldable-value", children: [_jsx("button", { type: "button", className: "fold-toggle", "aria-expanded": isExpanded, onClick: () => setIsExpanded((value) => !value), children: isExpanded ? '▼' : '▶' }), isExpanded
                ? renderContent()
                : _jsx("span", { className: "type-label", children: preview })] }));
};
const validateFoldLevel = (foldLevel) => {
    if (!Number.isInteger(foldLevel) || foldLevel < 0) {
        console.warn('[Rendrui] foldLevel must be a non-negative integer. Falling back to 0.');
        return 0;
    }
    return foldLevel;
};
const RenderField = ({ value, path, onEdit }) => {
    const [inputValue, setInputValue] = useState(null);
    const isEditing = inputValue !== null;
    const isEditAvailable = typeof onEdit === 'function';
    const serializedValue = JSON.stringify(value);
    const valueIsColor = typeof value === 'string' && isColor(value);
    const styleColor = valueIsColor ? { color: value } : {};
    const handleSave = () => {
        if (inputValue === null)
            return;
        try {
            const parsedValue = JSON.parse(inputValue);
            onEdit?.(path, parsedValue);
            setInputValue(null);
        }
        catch (e) {
            console.error('Error on saving. Invalid JSON?');
        }
    };
    return isEditing ? (_jsxs("div", { className: "edit-field", children: [_jsx("input", { value: inputValue, onChange: (e) => setInputValue(e.target.value), autoFocus: true }), _jsx("button", { type: "button", className: "button-ok", onClick: handleSave, children: "\u2713" }), _jsx("button", { type: "button", className: "button-esc", onClick: () => setInputValue(null), children: "\u2715" })] })) : (_jsx("span", { className: isEditAvailable ? "editable-value" : "value-text", onClick: () => isEditAvailable &&
            setInputValue(serializedValue ?? ''), style: styleColor, children: serializedValue }));
};
const renderObject = (obj, onEdit, layer = 0, pathPrefix = '', customRenderers, foldLevel = 0, allowFold = true) => {
    const itemType = Array.isArray(obj) ? 'array' : typeof obj;
    const isArray = (itemType === 'array');
    const isObject = itemType === 'object' && obj !== null;
    if (allowFold && foldLevel > 0 && layer > foldLevel && (isArray || isObject)) {
        return (_jsx(FoldableValue, { preview: isArray ? '[…]' : '{…}', renderContent: () => renderObject(obj, onEdit, layer, pathPrefix, customRenderers, foldLevel, false) }));
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
            }
            else {
                onEdit(pathPrefix, [...obj, {}]);
            }
        }
    };
    if (isArray) {
        return (_jsxs("div", { className: "array-block", children: [_jsx("span", { className: "type-label", children: "array: " }), "[ ", obj.map((item, index) => {
                    const currentPath = `${pathPrefix}[${index}]`;
                    const paddingLeft = `${layer * 20}px`;
                    return (_jsx("div", { className: "array-item", style: { paddingLeft }, children: renderObject(item, onEdit, layer + 1, currentPath, customRenderers, foldLevel) }, currentPath));
                }), " ]", onEdit &&
                    _jsxs("div", { className: "array-controls", children: [_jsxs("span", { className: "type-label", children: [" (", itemType, ") "] }), _jsx("button", { type: "button", onClick: onArrayEdit, children: (obj.length === 0)
                                    ? '+ Добавить первый элемент'
                                    : 'Добавить элемент' })] })] }));
    }
    if (isObject) {
        return Object.keys(obj).map((key) => {
            const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
            const paddingLeft = layer === 0 ? '10px' : `${layer * 20}px`;
            const hasNestedObject = obj[key] !== null &&
                typeof obj[key] === 'object';
            const rowClass = hasNestedObject
                ? 'object-row has-nested-object'
                : 'object-row';
            return (_jsxs("div", { className: rowClass, style: { paddingLeft }, children: [_jsxs("div", { className: "key-cell", children: [key, ":"] }), renderObject(obj[key], onEdit, layer + 1, currentPath, customRenderers, foldLevel)] }, currentPath));
        });
    }
    return (_jsxs("div", { className: cellClass, children: [_jsx(RenderField, { value: obj, path: pathPrefix, onEdit: onEdit }), _jsxs("span", { className: "type-label", children: [" (", itemType, ")"] })] }));
};
export const ObjectRenderer = ({ dataToRender, header, onEdit, customRenderers, className, foldLevel = 0 }) => {
    const safeFoldLevel = validateFoldLevel(foldLevel);
    const handleFieldEdit = (path, newValue) => {
        const updatedObj = setValueByPath(JSON.parse(JSON.stringify(dataToRender)), path, newValue);
        onEdit?.({ updated_src: updatedObj });
    };
    return (_jsxs("div", { className: className ? "object-renderer " + className : "object-renderer", children: [header && _jsx("h3", { children: header }), renderObject(dataToRender, onEdit && handleFieldEdit, 0, '', customRenderers, safeFoldLevel)] }));
};
