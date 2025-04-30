import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './style.css';
const isColor = (str) => {
    if (/^#([\da-f]{3}|[\da-f]{6})$/i.test(str))
        return true;
    return str.match(/^rgba?\(\s*(\d{1,3})(\s*,\s*(\d{1,3}))(\s*,\s*(\d{1,3}))(\s*,\s*[\d.]+)?\s*\)$/i);
};
const getValueByPath = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
};
const setValueByPath = (obj, path, value) => {
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
const RenderField = ({ value, path, onEdit }) => {
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
        }
        catch (e) {
            console.error('Error on saving. Invalid JSON?');
        }
    };
    useEffect(() => setInputValue(JSON.stringify(value)), [value]);
    return isEditing ? (_jsxs("div", { className: "edit-field", children: [_jsx("input", { value: inputValue, onChange: (e) => setInputValue(e.target.value), autoFocus: true }), _jsx("button", { className: "button-ok", onClick: handleSave, children: "\u2713" }), _jsx("button", { className: "button-esc", onClick: () => setIsEditing(false), children: "\u2715" })] })) : (_jsx("span", { className: isEditAvailable ? "editable-value" : "value-text", onClick: () => isEditAvailable && setIsEditing(true), style: styleColor, children: JSON.stringify(value) }));
};
const renderObject = (obj, onEdit, layer = 0, pathPrefix = '', customRenderers) => {
    if (customRenderers) {
        for (const renderer of customRenderers) {
            if (renderer.match(obj, pathPrefix)) {
                return renderer.render({ value: obj, path: pathPrefix, onEdit });
            }
        }
    }
    const itemType = Array.isArray(obj) ? 'array' : typeof obj;
    const cellClass = onEdit ? 'value-cell-editable' : 'value-cell';
    if (itemType === 'array') {
        if (obj.length === 0 && onEdit) {
            return (_jsxs("div", { className: "empty-array", children: [_jsxs("span", { className: "type-label", children: [" (", itemType, ") "] }), _jsx("button", { onClick: () => onEdit(pathPrefix, [{}]), children: "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u0435\u0440\u0432\u044B\u0439 \u044D\u043B\u0435\u043C\u0435\u043D\u0442" })] }));
        }
        return (_jsxs("div", { className: "array-block", children: [_jsx("span", { className: "type-label", children: "array: [" }), obj.map((item, index) => {
                    const currentPath = `${pathPrefix}[${index}]`;
                    const paddingLeft = `${layer * 20}px`;
                    return (_jsx("div", { className: "array-item", style: { paddingLeft }, children: renderObject(item, onEdit, layer + 1, currentPath, customRenderers) }, currentPath));
                }), onEdit &&
                    _jsxs("div", { className: "array-controls", children: [_jsxs("span", { className: "type-label", children: [" (", itemType, ") "] }), _jsx("button", { onClick: () => onEdit(pathPrefix, [...obj, {}]), children: "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u044D\u043B\u0435\u043C\u0435\u043D\u0442" })] }), "]"] }));
    }
    if (itemType === 'object' && obj !== null) {
        return Object.keys(obj).map((key) => {
            const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
            const paddingLeft = layer === 0 ? '10px' : `${layer * 20}px`;
            const rowClass = typeof obj[key] === 'object' ? 'object-row has-nested-object' : 'object-row';
            return (_jsxs("div", { className: rowClass, style: { paddingLeft }, children: [_jsxs("div", { className: "key-cell", children: [key, ":"] }), renderObject(obj[key], onEdit, layer + 1, currentPath, customRenderers)] }, currentPath));
        });
    }
    return (_jsxs("div", { className: cellClass, children: [_jsx(RenderField, { value: obj, path: pathPrefix, onEdit: onEdit }), _jsxs("span", { className: "type-label", children: [" (", itemType, ")"] })] }));
};
export const ObjectRenderer = ({ dataToRender, header, onEdit, customRenderers }) => {
    const handleFieldEdit = (path, newValue) => {
        const updatedObj = setValueByPath(JSON.parse(JSON.stringify(dataToRender)), path, newValue);
        onEdit?.({ updated_src: updatedObj });
    };
    return (_jsxs("div", { className: "object-renderer", children: [_jsx("h3", { children: header }), renderObject(dataToRender, onEdit && handleFieldEdit, 0, '', customRenderers)] }));
};
