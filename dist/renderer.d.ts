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
    onSelect?: (id: any) => void;
    customRenderers?: CustomRenderer[];
    className?: string;
    foldLevel?: number;
}
export declare const ObjectRenderer: ({ dataToRender, header, onEdit, customRenderers, className, foldLevel }: ObjectRendererProps) => import("react/jsx-runtime").JSX.Element;
