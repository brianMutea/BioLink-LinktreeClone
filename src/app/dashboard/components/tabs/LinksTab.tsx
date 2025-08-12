'use client'

import { useState, useEffect } from 'react'
import { Profile, Link, Collection } from '@/types'
import { Button } from '@/components/ui/button'
import { Plus, AlertCircle, Folder, GripVertical, MoreHorizontal, ChevronDown, ChevronRight, Trash2, Unlink } from 'lucide-react'
import AddLinkModal from '../AddLinkModal'
import EditLinkModal from '../EditLinkModal'
import AddCollectionModal from '../AddCollectionModal'
import { createClient } from '@/utils/supabase/client'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface LinksTabProps {
  profile: Profile
  links: Link[]
  collections: Collection[]
  onLinksChange: (links: Link[]) => void
  onCollectionsChange: (collections: Collection[]) => void
}

// Sortable Link Item Component
function SortableLinkItem({ link, onEdit, onDelete }: { 
  link: Link
  onEdit: (link: Link) => void
  onDelete: (linkId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-3 sm:p-4 ${isDragging ? 'shadow-lg' : 'shadow-sm'}`}
    >
      <div className="flex items-center space-x-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded touch-manipulation"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Link Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">{link.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{link.url}</p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <span className="text-xs text-gray-500 hidden sm:inline">{link.click_count} clicks</span>
              <button
                onClick={() => onEdit(link)}
                className="p-1 hover:bg-gray-100 rounded cursor-pointer touch-manipulation"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sortable Collection Component
function SortableCollection({
  collection,
  links,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onUngroup,
  onLinkEdit,
  onLinkDelete
}: {
  collection: Collection
  links: Link[]
  isExpanded: boolean
  onToggle: () => void
  onEdit: (collection: Collection) => void
  onDelete: (collectionId: string) => void
  onUngroup: (collectionId: string) => void
  onLinkEdit: (link: Link) => void
  onLinkDelete: (linkId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const collectionLinks = links.filter(link => link.collection_id === collection.id)
    .sort((a, b) => a.position - b.position)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-gray-200 rounded-lg ${isDragging ? 'shadow-lg' : ''}`}
    >
      {/* Collection Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded touch-manipulation"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          <div>
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">{collection.title}</h3>
            <p className="text-xs sm:text-sm text-gray-500">{collectionLinks.length} links</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onUngroup(collection.id)}
            className="p-1 hover:bg-gray-200 rounded text-blue-600 cursor-pointer touch-manipulation"
            title="Ungroup all links"
          >
            <Unlink className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(collection.id)}
            className="p-1 hover:bg-gray-200 rounded text-red-600 cursor-pointer touch-manipulation"
            title="Delete collection"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-200 rounded cursor-pointer touch-manipulation"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Collection Links */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-3 bg-white rounded-b-lg">
          {collectionLinks.length > 0 ? (
            <SortableContext items={collectionLinks.map(l => l.id)} strategy={verticalListSortingStrategy}>
              {collectionLinks.map((link) => (
                <SortableLinkItem
                  key={link.id}
                  link={link}
                  onEdit={onLinkEdit}
                  onDelete={onLinkDelete}
                />
              ))}
            </SortableContext>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <Folder className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs sm:text-sm">Drop links here or add new ones</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function LinksTab({ profile, links, collections, onLinksChange, onCollectionsChange }: LinksTabProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle mounting and expand collections
  useEffect(() => {
    setMounted(true)
    // Expand all collections by default
    const allCollectionIds = new Set(collections.map(c => c.id))
    setExpandedCollections(allCollectionIds)
    setLoading(false)
  }, [collections])

  const handleUpdateLink = (updatedLink: Link) => {
    const updatedLinks = links.map(link => 
      link.id === updatedLink.id ? updatedLink : link
    )
    onLinksChange(updatedLinks)
    setEditingLink(null)
  }

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId)

      if (error) throw error

      const updatedLinks = links.filter(link => link.id !== linkId)
      onLinksChange(updatedLinks)
    } catch (error) {
      console.error('Error deleting link:', error)
    }
  }

  const handleAddCollection = (newCollection: Collection) => {
    onCollectionsChange([...collections, newCollection])
    setExpandedCollections(prev => new Set([...prev, newCollection.id]))
    setShowAddCollectionModal(false)
  }

  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm('Are you sure you want to delete this collection? Links will be moved to ungrouped.')) return
    
    try {
      const supabase = createClient()
      
      // Move all links in this collection to ungrouped
      await supabase
        .from('links')
        .update({ collection_id: null })
        .eq('collection_id', collectionId)

      // Delete the collection
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId)

      if (error) throw error

      // Update local state
      onCollectionsChange(collections.filter(c => c.id !== collectionId))
      setExpandedCollections(prev => {
        const newSet = new Set(prev)
        newSet.delete(collectionId)
        return newSet
      })

      // Refresh links to show updated collection_id
      const updatedLinks = links.map(link => 
        link.collection_id === collectionId 
          ? { ...link, collection_id: null }
          : link
      )
      onLinksChange(updatedLinks)
    } catch (error) {
      console.error('Error deleting collection:', error)
    }
  }

  const handleUngroupCollection = async (collectionId: string) => {
    if (!confirm('Are you sure you want to ungroup all links in this collection? The collection will remain but all links will be moved to ungrouped.')) return
    
    try {
      const supabase = createClient()
      
      // Move all links in this collection to ungrouped
      const { error } = await supabase
        .from('links')
        .update({ collection_id: null })
        .eq('collection_id', collectionId)

      if (error) throw error

      // Update local state
      const updatedLinks = links.map(link =>
        link.collection_id === collectionId
          ? { ...link, collection_id: null }
          : link
      )
      onLinksChange(updatedLinks)
    } catch (error) {
      console.error('Error ungrouping collection:', error)
    }
  }

  const toggleCollection = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections)
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId)
    } else {
      newExpanded.add(collectionId)
    }
    setExpandedCollections(newExpanded)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Remove the state updates from dragOver to prevent infinite re-renders
    // We'll handle all updates in dragEnd instead
    return
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    try {
      const supabase = createClient()

      // Find what we're dragging
      const activeLink = links.find(link => link.id === activeId)
      const activeCollection = collections.find(collection => collection.id === activeId)

      if (activeLink) {
        // Handle link reordering and collection changes
        const overLink = links.find(link => link.id === overId)
        const overCollection = collections.find(collection => collection.id === overId)
        
        let newCollectionId = activeLink.collection_id
        let newPosition = activeLink.position

        if (overCollection) {
          // Dropped on a collection
          newCollectionId = overCollection.id
        } else if (overId === 'ungrouped') {
          // Dropped on ungrouped area
          newCollectionId = null
        } else if (overLink) {
          // Dropped on another link - same collection as that link
          newCollectionId = overLink.collection_id
          
          // Reorder within the same collection
          if (newCollectionId === activeLink.collection_id) {
            const sameCollectionLinks = links
              .filter(link => link.collection_id === newCollectionId)
              .sort((a, b) => a.position - b.position)
            
            const oldIndex = sameCollectionLinks.findIndex(link => link.id === activeId)
            const newIndex = sameCollectionLinks.findIndex(link => link.id === overId)
            
            if (oldIndex !== -1 && newIndex !== -1) {
              const reorderedLinks = arrayMove(sameCollectionLinks, oldIndex, newIndex)
              
              // Update positions for all links in this collection
              const updatedLinks = links.map(link => {
                if (link.collection_id === newCollectionId) {
                  const newPos = reorderedLinks.findIndex(l => l.id === link.id)
                  return { ...link, position: newPos }
                }
                return link
              })
              onLinksChange(updatedLinks)
              
              // Update positions in database
              for (let i = 0; i < reorderedLinks.length; i++) {
                await supabase
                  .from('links')
                  .update({ position: i })
                  .eq('id', reorderedLinks[i].id)
              }
              return
            }
          }
        }

        // Update link's collection and position in database
        await supabase
          .from('links')
          .update({
            collection_id: newCollectionId,
            updated_at: new Date().toISOString()
          })
          .eq('id', activeId)

        // Update local state
        const updatedLinks = links.map(link =>
          link.id === activeId
            ? { ...link, collection_id: newCollectionId }
            : link
        )
        onLinksChange(updatedLinks)
      }

      // Handle collection reordering
      if (activeCollection) {
        const overCollection = collections.find(collection => collection.id === overId)
        
        if (overCollection) {
          const oldIndex = collections.findIndex(collection => collection.id === activeId)
          const newIndex = collections.findIndex(collection => collection.id === overId)
          
          const newCollections = arrayMove(collections, oldIndex, newIndex)
          onCollectionsChange(newCollections)

          // Update positions in database
          for (let i = 0; i < newCollections.length; i++) {
            await supabase
              .from('collections')
              .update({ position: i })
              .eq('id', newCollections[i].id)
          }
        }
      }
    } catch (error) {
      console.error('Error updating positions:', error)
    }
  }

  // Group links by collection
  const unGroupedLinks = links.filter(link => !link.collection_id)
    .sort((a, b) => a.position - b.position)
  const groupedLinks = collections.map(collection => ({
    collection,
    links: links.filter(link => link.collection_id === collection.id)
  }))

  const allItems = [
    ...collections.map(c => c.id),
    ...unGroupedLinks.map(l => l.id)
  ]

  // Prevent hydration mismatch by not rendering drag-and-drop until mounted
  if (!mounted) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-blue-800">
                  <span className="font-medium">🔥 Your BioLink is live:</span>{' '}
                  <a 
                    href={`/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline cursor-pointer break-all"
                  >
                    biolink/{profile.username}
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">{profile.bio || 'Add bio in settings'}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddCollectionModal(true)}
                className="cursor-pointer"
              >
                <Folder className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Add collection</span>
                <span className="sm:hidden">Collection</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Add Link Button */}
        <div className="mb-4 sm:mb-6">
          <Button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Add
          </Button>
        </div>

        {/* Collections and Links */}
        <SortableContext items={allItems} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 sm:space-y-4">
            {/* Collections */}
            {collections.map((collection) => (
              <SortableCollection
                key={collection.id}
                collection={collection}
                links={links}
                isExpanded={expandedCollections.has(collection.id)}
                onToggle={() => toggleCollection(collection.id)}
                onEdit={() => {}} // TODO: Implement collection editing
                onDelete={handleDeleteCollection}
                onUngroup={handleUngroupCollection}
                onLinkEdit={setEditingLink}
                onLinkDelete={handleDeleteLink}
              />
            ))}

            {/* Ungrouped Links */}
            {unGroupedLinks.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <div className="p-3 sm:p-4 bg-gray-50 rounded-t-lg border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-gray-700 text-sm sm:text-base">Ungrouped Links</h3>
                      <p className="text-xs sm:text-sm text-gray-500">{unGroupedLinks.length} links</p>
                    </div>
                  </div>
                </div>
                <div id="ungrouped" className="p-3 sm:p-4 space-y-3 bg-white rounded-b-lg">
                  <SortableContext items={unGroupedLinks.map(l => l.id)} strategy={verticalListSortingStrategy}>
                    {unGroupedLinks.map((link) => (
                      <SortableLinkItem
                        key={link.id}
                        link={link}
                        onEdit={setEditingLink}
                        onDelete={handleDeleteLink}
                      />
                    ))}
                  </SortableContext>
                </div>
              </div>
            )}

            {/* Drop Zone for Ungrouped Links when no ungrouped links exist */}
            {unGroupedLinks.length === 0 && collections.length > 0 && (
              <div
                id="ungrouped"
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <Folder className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm sm:text-base text-gray-500">Drop links here to ungroup them</p>
              </div>
            )}

            {/* Empty State */}
            {links.length === 0 && collections.length === 0 && !loading && (
              <div className="text-center py-8 sm:py-12">
                <Folder className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No links yet</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4">Start by adding your first link or creating a collection</p>
              </div>
            )}
          </div>
        </SortableContext>

        {/* Add Link Modal */}
        {showAddModal && (
          <AddLinkModal
            onClose={() => setShowAddModal(false)}
            onAdd={(newLink) => {
              onLinksChange([...links, newLink])
              setShowAddModal(false)
            }}
            profile={profile}
          />
        )}

        {/* Add Collection Modal */}
        {showAddCollectionModal && (
          <AddCollectionModal
            onClose={() => setShowAddCollectionModal(false)}
            onAdd={handleAddCollection}
            profile={profile}
          />
        )}

        {/* Edit Link Modal */}
        {editingLink && (
          <EditLinkModal
            link={editingLink}
            onClose={() => setEditingLink(null)}
            onUpdate={handleUpdateLink}
            onDelete={handleDeleteLink}
          />
        )}

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-lg opacity-90">
              <div className="flex items-center space-x-3">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <div className="font-medium text-gray-900 text-sm sm:text-base">
                  {links.find(l => l.id === activeId)?.title || 
                   collections.find(c => c.id === activeId)?.title}
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}