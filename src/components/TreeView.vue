<template>
    <div class="tree-node">
        <div class="node-content">
            <span
                v-if="node.isFolder"
                @click="toggleFolder(node)"
                class="folder-icon"
            >
                {{ node.isExpanded ? '📂' : '📁' }}
            </span>
            <span v-else class="file-icon">📄</span>
            {{ node.name }}
            <button @click="removeItem(node)" class="action-button">
                Remove
            </button>
            <button
                v-if="node.isFolder"
                @click="addItem(node, true)"
                class="action-button"
            >
                Add Folder
            </button>
            <button
                v-if="node.isFolder"
                @click="addItem(node, false)"
                class="action-button"
            >
                Add File
            </button>
        </div>
        <div v-if="node.isFolder && node.isExpanded" class="children">
            <TreeView
                v-for="child in node.children"
                :key="child.name"
                :node="child"
                @toggle="$emit('toggle', $event)"
                @remove="$emit('remove', $event)"
                @add="$emit('add', $event)"
            />
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
    node: Object,
});

const emit = defineEmits(['toggle', 'remove', 'add']);

const toggleFolder = (node) => {
    emit('toggle', node);
};

const removeItem = (node) => {
    emit('remove', node);
};

const addItem = (node, isFolder) => {
    const name = prompt(`Enter name for new ${isFolder ? 'folder' : 'file'}:`);
    if (name) {
        emit('add', { parent: node, name, isFolder });
    }
};
</script>

<style scoped>
.tree-node {
    margin-left: 20px;
}
.node-content {
    display: flex;
    align-items: center;
    margin: 5px 0;
}
.folder-icon,
.file-icon {
    margin-right: 5px;
    cursor: pointer;
}
.action-button {
    margin-left: 10px;
    font-size: 0.8em;
}
.children {
    margin-left: 20px;
}
</style>
