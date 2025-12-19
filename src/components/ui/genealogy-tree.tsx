import React, { useState, useCallback, useMemo } from 'react';
import Tree, { RawNodeDatum, TreeNodeDatum, CustomNodeElementProps, Point } from 'react-d3-tree';
import { GenealogyNode } from '@shared/types';
import { User, Users, Award, ChevronDown, ChevronRight, Star, UserCircle, ZoomIn, ZoomOut, RotateCcw, X, Calendar, Trophy, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

interface GenealogyTreeProps {
  data: GenealogyNode;
  className?: string;
  onNodeClick?: (node: GenealogyNode) => void;
  showStats?: boolean;
}

// Convert GenealogyNode to react-d3-tree format
function convertToTreeData(node: GenealogyNode): RawNodeDatum {
  return {
    name: node.name,
    attributes: {
      userId: node.userId,
      role: node.role,
      points: node.points.toString(),
      referralCode: node.referralCode,
      directReferrals: node.directReferrals.toString(),
      totalDownline: node.totalDownline.toString(),
      teamPoints: node.teamPoints.toString(),
      avatarUrl: node.avatarUrl || '',
      joinedAt: node.joinedAt.toString(),
    },
    children: node.children.map(convertToTreeData),
  };
}

// Custom node component props with our own click handler
interface CustomNodeProps extends CustomNodeElementProps {
  onNodeSelect?: (nodeData: TreeNodeDatum) => void;
}

// Custom node component for the tree
const CustomNode: React.FC<CustomNodeProps> = ({ nodeDatum, toggleNode, onNodeSelect }) => {
  const attrs = nodeDatum.attributes as Record<string, string> | undefined;
  const isCoach = attrs?.role === 'coach';
  const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
  const isCollapsed = nodeDatum.__rd3t?.collapsed;

  const points = parseInt(attrs?.points || '0');
  const directReferrals = parseInt(attrs?.directReferrals || '0');
  const totalDownline = parseInt(attrs?.totalDownline || '0');

  const initials = nodeDatum.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const hasAvatar = attrs?.avatarUrl && attrs.avatarUrl.length > 0;
  const uniqueClipId = `avatar-clip-${attrs?.userId || Math.random().toString(36).substr(2, 9)}`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNodeSelect) {
      onNodeSelect(nodeDatum);
    }
  };

  return (
    <g>
      {/* Define clipPath in defs */}
      <defs>
        <clipPath id={uniqueClipId}>
          <circle r={36} cx={0} cy={0} />
        </clipPath>
      </defs>

      {/* Clickable area - invisible rect for better click target */}
      <rect
        x={-45}
        y={-45}
        width={90}
        height={90}
        fill="transparent"
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      />

      {/* Node circle background */}
      <circle
        r={40}
        fill={isCoach ? '#1e3a5f' : '#1a2332'}
        stroke={isCoach ? '#f5c542' : '#64748b'}
        strokeWidth={3}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      />

      {/* Avatar image or initials */}
      {hasAvatar ? (
        <image
          href={attrs!.avatarUrl}
          x={-36}
          y={-36}
          width={72}
          height={72}
          clipPath={`url(#${uniqueClipId})`}
          preserveAspectRatio="xMidYMid slice"
          style={{ cursor: 'pointer', pointerEvents: 'none' }}
        />
      ) : (
        <text
          fill="#ffffff"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={20}
          fontWeight={700}
          style={{ pointerEvents: 'none' }}
        >
          {initials}
        </text>
      )}

      {/* Role badge - Coach indicator */}
      {isCoach && (
        <g transform="translate(30, -30)">
          <rect x={-22} y={-11} width={44} height={22} rx={11} fill="#f5c542" />
          <text
            fill="#1a202c"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fontWeight={700}
            style={{ pointerEvents: 'none' }}
          >
            COACH
          </text>
        </g>
      )}

      {/* Points badge - bright green for visibility */}
      <g transform="translate(0, 52)">
        <rect x={-32} y={-13} width={64} height={26} rx={13} fill="#22c55e" stroke="#16a34a" strokeWidth={1} />
        <text
          fill="#ffffff"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={14}
          fontWeight={700}
          style={{ pointerEvents: 'none' }}
        >
          {points} pts
        </text>
      </g>

      {/* Name label - GOLD background with WHITE text for max legibility */}
      <g transform="translate(0, 84)">
        <rect
          x={-72}
          y={-14}
          width={144}
          height={28}
          rx={6}
          fill="#b8860b"
          stroke="#f5c542"
          strokeWidth={2}
        />
        <text
          fill="#ffffff"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={13}
          fontWeight={700}
          style={{ pointerEvents: 'none' }}
        >
          {nodeDatum.name.length > 14 ? nodeDatum.name.slice(0, 14) + '...' : nodeDatum.name}
        </text>
      </g>

      {/* Referral stats - lighter background for contrast */}
      <g transform="translate(0, 114)">
        <rect
          x={-58}
          y={-11}
          width={116}
          height={22}
          rx={4}
          fill="#334155"
          stroke="#475569"
          strokeWidth={1}
        />
        <text
          fill="#e2e8f0"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={11}
          fontWeight={600}
          style={{ pointerEvents: 'none' }}
        >
          {directReferrals} direct | {totalDownline} total
        </text>
      </g>

      {/* Expand/Collapse button */}
      {hasChildren && (
        <g
          transform="translate(40, 0)"
          onClick={(e) => {
            e.stopPropagation();
            toggleNode();
          }}
          style={{ cursor: 'pointer' }}
        >
          <circle r={16} fill="#3b82f6" stroke="#93c5fd" strokeWidth={2} />
          <text
            fill="#ffffff"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={18}
            fontWeight={700}
            style={{ pointerEvents: 'none' }}
          >
            {isCollapsed ? '+' : '−'}
          </text>
        </g>
      )}
    </g>
  );
};

export function GenealogyTree({ data, className, onNodeClick, showStats = true }: GenealogyTreeProps) {
  const [translate, setTranslate] = useState<Point>({ x: 300, y: 50 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(0.7);
  const [selectedNode, setSelectedNode] = useState<GenealogyNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const treeData = useMemo(() => convertToTreeData(data), [data]);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      const { width, height } = node.getBoundingClientRect();
      setDimensions({ width, height });
      setTranslate({ x: width / 2, y: 80 });
    }
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.3));
  const handleResetZoom = () => setZoom(0.7);

  const handleNodeClick = (nodeData: TreeNodeDatum) => {
    if (nodeData.attributes) {
      // Reconstruct GenealogyNode from tree data
      const attrs = nodeData.attributes as Record<string, string>;
      const reconstructedNode: GenealogyNode = {
        userId: attrs.userId,
        name: nodeData.name,
        role: attrs.role as 'coach' | 'challenger',
        avatarUrl: attrs.avatarUrl || undefined,
        points: parseInt(attrs.points),
        referralCode: attrs.referralCode,
        joinedAt: parseInt(attrs.joinedAt),
        children: [],
        directReferrals: parseInt(attrs.directReferrals),
        totalDownline: parseInt(attrs.totalDownline),
        teamPoints: parseInt(attrs.teamPoints),
      };
      setSelectedNode(reconstructedNode);
      setIsModalOpen(true);
      if (onNodeClick) onNodeClick(reconstructedNode);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Stats Summary */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-navy-800 border-navy-700">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/10">
                <User className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Direct</p>
                <p className="text-lg font-semibold text-white">{data.directReferrals}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-navy-800 border-navy-700">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/10">
                <Users className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Team</p>
                <p className="text-lg font-semibold text-white">{data.totalDownline}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-navy-800 border-navy-700">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/10">
                <Award className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Your Points</p>
                <p className="text-lg font-semibold text-white">{data.points}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-navy-800 border-navy-700">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/10">
                <Star className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Team Points</p>
                <p className="text-lg font-semibold text-white">{data.teamPoints}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tree Visualization */}
      <Card className="bg-navy-800 border-navy-700 overflow-hidden">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-gold" />
            Referral Tree
          </CardTitle>
          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    className="h-8 w-8 p-0 bg-navy-700 border-navy-600 hover:bg-navy-600"
                  >
                    <ZoomOut className="h-4 w-4 text-slate-300" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom Out</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-xs text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    className="h-8 w-8 p-0 bg-navy-700 border-navy-600 hover:bg-navy-600"
                  >
                    <ZoomIn className="h-4 w-4 text-slate-300" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom In</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetZoom}
                    className="h-8 w-8 p-0 bg-navy-700 border-navy-600 hover:bg-navy-600"
                  >
                    <RotateCcw className="h-4 w-4 text-slate-300" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset Zoom</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div
            ref={containerRef}
            className="w-full h-[500px] bg-navy-900"
          >
            <Tree
              data={treeData}
              translate={translate}
              orientation="vertical"
              pathFunc="step"
              separation={{ siblings: 2.5, nonSiblings: 3 }}
              nodeSize={{ x: 180, y: 220 }}
              zoom={zoom}
              scaleExtent={{ min: 0.3, max: 2 }}
              enableLegacyTransitions
              transitionDuration={300}
              renderCustomNodeElement={(props) => (
                <CustomNode {...props} onNodeSelect={handleNodeClick} />
              )}
              pathClassFunc={() => 'stroke-[#f5c542] stroke-[3px] fill-none opacity-80'}
            />
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedNode?.avatarUrl ? (
                <Avatar className="h-12 w-12 border-2 border-gold">
                  <AvatarImage src={selectedNode.avatarUrl} alt={selectedNode.name} />
                  <AvatarFallback className="bg-navy-700 text-white">
                    {selectedNode.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-12 w-12 rounded-full bg-navy-700 border-2 border-gold flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {selectedNode?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{selectedNode?.name}</h3>
                {selectedNode?.role === 'coach' && (
                  <Badge className="bg-gold text-navy-900 text-xs">Coach</Badge>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedNode && (
            <div className="space-y-4 mt-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-navy-700/50 rounded-lg p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Trophy className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Points</p>
                    <p className="text-xl font-bold text-green-400">{selectedNode.points}</p>
                  </div>
                </div>
                <div className="bg-navy-700/50 rounded-lg p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gold/10">
                    <Star className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Team Points</p>
                    <p className="text-xl font-bold text-gold">{selectedNode.teamPoints}</p>
                  </div>
                </div>
                <div className="bg-navy-700/50 rounded-lg p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Direct Referrals</p>
                    <p className="text-xl font-bold text-blue-400">{selectedNode.directReferrals}</p>
                  </div>
                </div>
                <div className="bg-navy-700/50 rounded-lg p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Users className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Downline</p>
                    <p className="text-xl font-bold text-purple-400">{selectedNode.totalDownline}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2 pt-2 border-t border-navy-600">
                <div className="flex items-center gap-2 text-sm">
                  <Link2 className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-400">Referral Code:</span>
                  <code className="bg-navy-700 px-2 py-0.5 rounded text-gold font-mono">
                    {selectedNode.referralCode}
                  </code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-400">Joined:</span>
                  <span className="text-white">{formatDate(selectedNode.joinedAt)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simplified list view for smaller screens or simpler display
interface GenealogyListProps {
  data: GenealogyNode;
  className?: string;
  onNodeClick?: (node: GenealogyNode) => void;
  depth?: number;
  maxDepth?: number;
}

export function GenealogyList({
  data,
  className,
  onNodeClick,
  depth = 0,
  maxDepth = 3,
}: GenealogyListProps) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = data.children && data.children.length > 0;
  const isCoach = data.role === 'coach';

  const initials = data.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('', className)}>
      <div
        className={cn(
          'p-3 rounded-lg cursor-pointer transition-colors',
          'hover:bg-navy-700/50',
          depth === 0 && 'bg-navy-800 border border-navy-700'
        )}
        style={{ marginLeft: depth * 16 }}
        onClick={() => onNodeClick?.(data)}
      >
        {/* Main row with avatar, name, and points */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasChildren && depth < maxDepth ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-1 hover:bg-navy-600 rounded flex-shrink-0"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </button>
          ) : (
            <div className="w-6 flex-shrink-0" />
          )}

          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-gold/30 flex-shrink-0">
            {data.avatarUrl ? (
              <AvatarImage src={data.avatarUrl} alt={data.name} />
            ) : null}
            <AvatarFallback className="bg-navy-700 text-white text-xs sm:text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-medium text-white text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{data.name}</span>
              {isCoach && (
                <Badge variant="outline" className="text-gold border-gold text-[10px] sm:text-xs px-1.5 py-0">
                  Coach
                </Badge>
              )}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 truncate">
              {data.referralCode}
            </div>
          </div>

          <div className="text-right flex-shrink-0 ml-1">
            <div className="text-gold font-semibold text-sm sm:text-base">{data.points}</div>
            <div className="text-[10px] sm:text-xs text-slate-400">points</div>
          </div>
        </div>

        {/* Stats row - shown below on mobile for better spacing */}
        <div className="flex items-center gap-2 mt-1.5 ml-[52px] sm:ml-[60px] text-[11px] sm:text-xs text-slate-400">
          <span>{data.directReferrals} direct</span>
          {data.totalDownline > 0 && (
            <>
              <span className="text-slate-600">•</span>
              <span>{data.totalDownline} total</span>
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && depth < maxDepth && (
        <div className="mt-1">
          {data.children.map((child) => (
            <GenealogyList
              key={child.userId}
              data={child}
              onNodeClick={onNodeClick}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Mini tree for challengers (just shows their immediate downline)
interface MiniGenealogyProps {
  data: GenealogyNode;
  className?: string;
}

export function MiniGenealogy({ data, className }: MiniGenealogyProps) {
  if (data.directReferrals === 0) {
    return (
      <Card className={cn('bg-navy-800 border-navy-700', className)}>
        <CardContent className="p-6 text-center">
          <UserCircle className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No referrals yet</p>
          <p className="text-slate-500 text-xs mt-1">
            Share your referral code to start building your team
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-navy-800 border-navy-700', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-gold" />
          Your Referrals ({data.directReferrals})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.children.slice(0, 5).map((child) => (
            <div
              key={child.userId}
              className="flex items-center gap-3 p-2 rounded-lg bg-navy-700/50"
            >
              <Avatar className="h-8 w-8">
                {child.avatarUrl ? (
                  <AvatarImage src={child.avatarUrl} alt={child.name} />
                ) : null}
                <AvatarFallback className="bg-navy-600 text-white text-xs">
                  {child.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{child.name}</p>
                <p className="text-xs text-slate-400">{child.points} points</p>
              </div>
              {child.role === 'coach' && (
                <Badge variant="outline" className="text-gold border-gold text-xs">
                  Coach
                </Badge>
              )}
            </div>
          ))}
          {data.children.length > 5 && (
            <p className="text-center text-xs text-slate-400 pt-2">
              +{data.children.length - 5} more referrals
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
