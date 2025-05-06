import { type ReactNode } from 'react';
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
    onEdit?: (editData: {
        updated_src: any;
    }) => void;
    autoCollapse?: boolean;
    onSelect?: (id: any) => void;
    customRenderers?: CustomRenderer[];
    className?: string;
}
export declare const ObjectRenderer: ({ dataToRender, header, onEdit, customRenderers, className }: ObjectRendererProps) => import("react/jsx-runtime").JSX.Element;
