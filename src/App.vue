<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useFileTree } from './composables/useFileTree';
import { useAddItem } from './composables/useAddItem';
import FileTree from './components/FileTree.vue';
import AddItemModal from './components/AddItemModal.vue';

const { fileTree, expandedItems, directories, fetchFileTree, deleteItem } =
    useFileTree();

const {
    showAddModal,
    newItemName,
    selectedDirectory,
    isAddingFolder,
    expandedModalItems,
    activatedItems,
    addItem,
    openAddModal,
    handleSelection,
} = useAddItem(fileTree);

onMounted(() => {
    fetchFileTree();
});

watch(
    fileTree,
    () => {
        if (fileTree.value) {
            localStorage.setItem('fileTree', JSON.stringify(fileTree.value));
        }
    },
    { deep: true }
);
</script>

<template>
    <v-app theme="custom">
        <v-main>
            <v-container>
                <h1 class="text-h4 mb-4">File Explorer</h1>
                <div class="mb-4">
                    <v-btn class="mr-2" @click="openAddModal(false)"
                        >Add File</v-btn
                    >
                    <v-btn @click="openAddModal(true)">Add Folder</v-btn>
                </div>
                <div v-if="fileTree" class="filetree-container">
                    <FileTree
                        :items="fileTree"
                        :expanded-items="expandedItems"
                        @update:expanded-items="expandedItems = $event"
                        @delete-item="deleteItem"
                    />
                </div>
                <div v-else>Loading...</div>
            </v-container>
        </v-main>

        <AddItemModal
            v-model="showAddModal"
            v-model:new-item-name="newItemName"
            v-model:selected-directory="selectedDirectory"
            :is-adding-folder="isAddingFolder"
            :directories
            :expanded-modal-items="expandedModalItems"
            :activated-items="activatedItems"
            @add-item="addItem"
            @handle-selection="handleSelection"
        />
    </v-app>
</template>

<style scoped>
.filetree-container {
    display: flex;
}

:deep(.v-treeview-node__root) {
    min-height: 30px;
}

:deep(.v-select__content) {
    max-height: 300px;
    overflow-y: auto;
}

:deep(.v-list) {
    min-width: 320px;
}
</style>
