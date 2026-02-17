import React from 'react';
import TreeNode, { TreeNodeType } from '../molecules/TreeNode';



export type TreeViewProps = {
    treeData: TreeNodeType[]
}

export default function TreeView({ treeData }: TreeViewProps) {
    return (
        <>
            {treeData.map((node) => (
                <TreeNode key={node.id} id={node.id} name={node.name} macro={node.macro} fullName={node.fullName} IconComponent={node.IconComponent} iconProps={node.iconProps} children={node.children} />
            ))}
        </>
    );
};
