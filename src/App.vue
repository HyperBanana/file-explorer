<template>
    <div class="file-explorer">
        <h1>File Explorer</h1>
        <div v-if="fileTree">
            <TreeView
                :node="fileTree"
                @toggle="toggleFolder"
                @remove="removeItem"
                @add="addItem"
            />
        </div>
        <div v-else>Loading...</div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import TreeView from './components/TreeView.vue';

const fileTree = ref(null);

const fetchFileTree = async () => {
    try {
        const response = await fetch(
            'https://ab-file-explorer.athleticnext.workers.dev/?file=regular'
        );
        const data = await response.json();
        fileTree.value = processFileTree(data);
    } catch (error) {
        console.error('Error fetching file tree:', error);
    }
};

const processFileTree = (data) => {
    const root = {
        name: data.name,
        children: [],
        isFolder: true,
        isExpanded: true,
    };
    const paths = data.filepaths;

    paths.forEach((path) => {
        const parts = path.split('/');
        let currentNode = root;

        parts.forEach((part, index) => {
            let child = currentNode.children.find((c) => c.name === part);
            if (!child) {
                child = {
                    name: part,
                    children: [],
                    isFolder: index < parts.length - 1,
                    isExpanded: false,
                };
                currentNode.children.push(child);
            }
            currentNode = child;
        });
    });

    return root;
};

const toggleFolder = (node) => {
    node.isExpanded = !node.isExpanded;
};

const removeNodeRecursively = (parent, nodeToRemove) => {
    const index = parent.children.findIndex((child) => child === nodeToRemove);
    if (index !== -1) {
        parent.children.splice(index, 1);
    } else {
        parent.children.forEach((child) => {
            if (child.isFolder) {
                removeNodeRecursively(child, nodeToRemove);
            }
        });
    }
};

const removeItem = (node) => {
    removeNodeRecursively(fileTree.value, node);
};

const addItem = ({ parent, name, isFolder }) => {
    const newNode = {
        name,
        isFolder,
        children: [],
        isExpanded: false,
    };
    parent.children.push(newNode);
};

const saveState = () => {
    localStorage.setItem('fileExplorerState', JSON.stringify(fileTree.value));
};

const loadState = () => {
    const savedState = localStorage.getItem('fileExplorerState');
    if (savedState) {
        fileTree.value = JSON.parse(savedState);
    } else {
        fetchFileTree();
    }
};

watch(fileTree, saveState, { deep: true });

onMounted(() => {
    loadState();
});
</script>

<style scoped>
.file-explorer {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}
</style>
