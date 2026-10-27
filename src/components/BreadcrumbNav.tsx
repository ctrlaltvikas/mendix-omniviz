import { createElement, FC } from "react";

export interface BreadcrumbNode {
    id: string;
    name: string;
    level?: string;
}

export interface BreadcrumbNavProps {
    trail: BreadcrumbNode[];
    onNavigate: (node: BreadcrumbNode, index: number) => void;
    textColor: string;
    subTextColor: string;
}

export const BreadcrumbNav: FC<BreadcrumbNavProps> = ({
    trail,
    onNavigate,
    textColor,
    subTextColor
}) => {
    if (!trail || trail.length <= 1) {
        return null;
    }

    return (
        <div className="omni-viz-breadcrumb">
            {trail.map((node, index) => {
                const isLast = index === trail.length - 1;
                return (
                    <span key={node.id + index} className="omni-viz-breadcrumb-item">
                        {isLast ? (
                            <span
                                className="omni-viz-breadcrumb-active"
                                style={{ color: textColor }}
                            >
                                {node.name}
                            </span>
                        ) : (
                            <button
                                type="button"
                                className="omni-viz-breadcrumb-btn"
                                style={{ color: subTextColor }}
                                onClick={() => onNavigate(node, index)}
                            >
                                {node.name}
                            </button>
                        )}
                        {!isLast && (
                            <span
                                className="omni-viz-breadcrumb-separator"
                                style={{ color: subTextColor }}
                            >
                                ❯
                            </span>
                        )}
                    </span>
                );
            })}
        </div>
    );
};
