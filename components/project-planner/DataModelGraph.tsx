"use client"

import { useMemo } from "react"
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import dagre from "dagre"
import { cn } from "@/lib/utils"

interface Entity {
  id: string
  name: string
  fields: string[]
}

interface Relationship {
  from: string
  to: string
  label: string
}

function parseDataModel(content: string): {
  entities: Entity[]
  relationships: Relationship[]
} {
  const entities: Entity[] = []
  const relationships: Relationship[] = []
  const lines = content.split("\n")
  let currentEntity: Entity | null = null

  for (const line of lines) {
    const entityMatch = line.match(/\*\*([^*]+)\*\*/)
    if (entityMatch) {
      if (currentEntity) {
        entities.push(currentEntity)
      }
      currentEntity = {
        id: entityMatch[1].toLowerCase().replace(/\s+/g, "-"),
        name: entityMatch[1],
        fields: [],
      }
    } else if (currentEntity) {
      const fkMatch = line.match(/FK\s*[→-]\s*(.+)/)
      if (fkMatch) {
        relationships.push({
          from: currentEntity.id,
          to: fkMatch[1].trim().toLowerCase().replace(/\s+/g, "-"),
          label: "FK",
        })
        currentEntity.fields.push(line.trim())
      } else if (line.trim() && !line.trim().startsWith("-")) {
        currentEntity.fields.push(line.trim())
      }
    }
  }
  if (currentEntity) {
    entities.push(currentEntity)
  }

  for (const line of lines) {
    const relMatch = line.match(
      /(.+?)\s+(has many|belongs to|has one|has and belongs to many)\s+(.+)/i,
    )
    if (relMatch) {
      const from = relMatch[1].trim().toLowerCase().replace(/\s+/g, "-")
      const to = relMatch[3].trim().toLowerCase().replace(/\s+/g, "-")
      if (
        !relationships.find((r) => r.from === from && r.to === to) &&
        entities.some((e) => e.id === from) &&
        entities.some((e) => e.id === to)
      ) {
        relationships.push({ from, to, label: relMatch[2].toLowerCase() })
      }
    }
  }

  return { entities, relationships }
}

function getLayoutedElements(
  entities: Entity[],
  relationships: Relationship[],
) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: "LR", nodesep: 80, ranksep: 120, marginx: 40, marginy: 40 })

  entities.forEach((entity) => {
    g.setNode(entity.id, { width: 200, height: 60 + entity.fields.length * 24 })
  })

  relationships.forEach((rel) => {
    g.setEdge(rel.from, rel.to)
  })

  dagre.layout(g)

  const nodes: Node[] = entities.map((entity) => {
    const node = g.node(entity.id)
    return {
      id: entity.id,
      type: "entityNode",
      position: { x: node.x - 100, y: node.y - 30 - (entity.fields.length * 12) },
      data: { entity },
    }
  })

  const edges: Edge[] = relationships.map((rel, i) => ({
    id: `e-${i}`,
    source: rel.from,
    target: rel.to,
    label: rel.label,
    type: "smoothstep",
    animated: true,
    style: { stroke: "oklch(0.77 0.134 178)", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "oklch(0.77 0.134 178)",
    },
    labelStyle: {
      fontFamily: "IBM Plex Mono, monospace",
      fontSize: 11,
      fill: "oklch(0.73 0.042 88)",
    },
  }))

  return { nodes, edges }
}

function EntityNode({ data }: NodeProps) {
  const { entity } = data as { entity: Entity }
  return (
    <div className="teal-card paper-card rounded-xl py-2.5 px-4 min-w-[180px] shadow-lg shadow-teal/5">
      <Handle type="target" position={Position.Left} className="!bg-teal !w-2.5 !h-2.5 !border-2 !border-background" />
      <div className="font-mono text-xs font-semibold text-teal uppercase tracking-wider mb-2 pt-1">
        {entity.name}
      </div>
      {entity.fields.length > 0 && (
        <div className="space-y-0.5 pb-1">
          {entity.fields.map((field, i) => {
            const isFk = field.includes("FK")
            return (
              <div
                key={i}
                className={cn(
                  "font-mono text-xs leading-5",
                  isFk ? "text-teal/80" : "text-muted-foreground",
                )}
              >
                {field}
              </div>
            )
          })}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-teal !w-2.5 !h-2.5 !border-2 !border-background"
      />
    </div>
  )
}

const nodeTypes = { entityNode: EntityNode }

interface DataModelGraphProps {
  content: string
}

export function DataModelGraph({ content }: DataModelGraphProps) {
  const { entities, relationships } = useMemo(
    () => parseDataModel(content),
    [content],
  )

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(entities, relationships),
    [entities, relationships],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

  if (
    nodes.length !== layoutedNodes.length ||
    edges.length !== layoutedEdges.length
  ) {
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
  }

  if (entities.length === 0) {
    return (
      <div className="paper-card rounded-2xl p-5">
        <p className="text-sm text-muted-foreground italic">
          Could not parse entities from the data model. Raw content shown below.
        </p>
        <pre className="mt-3 text-xs text-muted-foreground/80 whitespace-pre-wrap font-mono">
          {content}
        </pre>
      </div>
    )
  }

  return (
    <div className="paper-card rounded-2xl p-2">
      <div className="blueprint-surface rounded-xl h-[400px] overflow-hidden shadow-inner">
        <ReactFlow
          nodes={layoutedNodes}
          edges={layoutedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            color="oklch(0.98 0.02 88 / 6%)"
            gap={24}
            size={1}
          />
          <Controls
            className="!bg-card !border-border !rounded-lg"
            showInteractive={false}
          />
          <MiniMap
            className="!bg-card !border-border !rounded-lg"
            nodeColor="oklch(0.77 0.134 178 / 0.3)"
            maskColor="oklch(0 0 0 / 0.4)"
          />
        </ReactFlow>
      </div>
    </div>
  )
}
