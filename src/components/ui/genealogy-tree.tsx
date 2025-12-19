import React, { useState, useCallback, useMemo } from 'react';
import Tree, { RawNodeDatum, TreeNodeDatum, CustomNodeElementProps, Point } from 'react-d3-tree';
import { GenealogyNode } from '@shared/types';
import { User, Users, Award, ChevronDown, ChevronRight, Star, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
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

// Custom node component for the tree
const CustomNode: React.FC<CustomNodeElementProps> = ({ nodeDatum, toggleNode, onNodeClick }) => {
  const attrs = nodeDatum.attributes as Record<string, string> | undefined;
  const isCoach = attrs?.role === 'coach';
  const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
  const isCollapsed = nodeDatum.__rd3t?.collapsed;

  const points = parseInt(attrs?.points || '0');
  const directReferrals = parseInt(attrs?.directReferrals || '0');
  const totalDownline = parseInt(attrs?.totalDownline || '0');
  const teamPoints = parseInt(attrs?.teamPoints || '0');

  const initials = nodeDatum.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <g>
      {/* Node circle background */}
      <circle
        r={40}
        fill={isCoach ? '#0f172a' : '#1e293b'}
        stroke={isCoach ? '#d4af37' : '#475569'}
        strokeWidth={2}
        onClick={(e) => {
          e.stopPropagation();
          if (onNodeClick) {
            onNodeClick(nodeDatum as any);
          }
        }}
        style={{ cursor: 'pointer' }}
      />

      {/* Avatar or initials */}
      {attrs?.avatarUrl ? (
        <clipPath id={`avatar-clip-${attrs.userId}`}>
          <circle r={32} cx={0} cy={0} />
        </clipPath>
      ) : null}

      {attrs?.avatarUrl ? (
        <image
          href={attrs.avatarUrl}
          x={-32}
          y={-32}
          width={64}
          height={64}
          clipPath={`url(#avatar-clip-${attrs.userId})`}
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            if (onNodeClick) onNodeClick(nodeDatum as any);
          }}
        />
      ) : (
        <text
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={16}
          fontWeight={600}
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            if (onNodeClick) onNodeClick(nodeDatum as any);
          }}
        >
          {initials}
        </text>
      )}

      {/* Role badge */}
      {isCoach && (
        <g transform="translate(25, -30)">
          <rect x={-12} y={-8} width={24} height={16} rx={8} fill="#d4af37" />
          <text
            fill="#0f172a"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fontWeight={600}
          >
            COACH
          </text>
        </g>
      )}

      {/* Points badge */}
      <g transform="translate(-25, 30)">
        <rect x={-20} y={-8} width={40} height={16} rx={8} fill="#d4af37" />
        <text
          fill="#0f172a"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={9}
          fontWeight={600}
        >
          {points} pts
        </text>
      </g>

      {/* Name label */}
      <text
        fill="white"
        textAnchor="middle"
        y={60}
        fontSize={12}
        fontWeight={500}
      >
        {nodeDatum.name.length > 15 ? nodeDatum.name.slice(0, 15) + '...' : nodeDatum.name}
      </text>

      {/* Referral count */}
      {directReferrals > 0 && (
        <text
          fill="#94a3b8"
          textAnchor="middle"
          y={75}
          fontSize={10}
        >
          {directReferrals} direct | {totalDownline} total
        </text>
      )}

      {/* Expand/Collapse button */}
      {hasChildren && (
        <g
          transform="translate(0, 45)"
          onClick={(e) => {
            e.stopPropagation();
            toggleNode();
          }}
          style={{ cursor: 'pointer' }}
        >
          <circle r={12} fill="#334155" stroke="#475569" strokeWidth={1} />
          <text
            fill="white"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
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

  const treeData = useMemo(() => convertToTreeData(data), [data]);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      const { width, height } = node.getBoundingClientRect();
      setDimensions({ width, height });
      setTranslate({ x: width / 2, y: 80 });
    }
  }, []);

  const handleNodeClick = (nodeData: TreeNodeDatum) => {
    if (onNodeClick && nodeData.attributes) {
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
      onNodeClick(reconstructedNode);
    }
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
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-gold" />
            Referral Tree
          </CardTitle>
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
              separation={{ siblings: 2, nonSiblings: 2.5 }}
              nodeSize={{ x: 150, y: 150 }}
              zoom={0.8}
              enableLegacyTransitions
              transitionDuration={300}
              renderCustomNodeElement={(props) => (
                <CustomNode {...props} onNodeClick={handleNodeClick} />
              )}
              pathClassFunc={() => 'stroke-slate-600 stroke-2 fill-none'}
            />
          </div>
        </CardContent>
      </Card>
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
          'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
          'hover:bg-navy-700/50',
          depth === 0 && 'bg-navy-800 border border-navy-700'
        )}
        style={{ marginLeft: depth * 24 }}
        onClick={() => onNodeClick?.(data)}
      >
        {hasChildren && depth < maxDepth ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-1 hover:bg-navy-600 rounded"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        <Avatar className="h-10 w-10 border-2 border-gold/30">
          {data.avatarUrl ? (
            <AvatarImage src={data.avatarUrl} alt={data.name} />
          ) : null}
          <AvatarFallback className="bg-navy-700 text-white text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white truncate">{data.name}</span>
            {isCoach && (
              <Badge variant="outline" className="text-gold border-gold text-xs">
                Coach
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{data.referralCode}</span>
            <span>•</span>
            <span>{data.directReferrals} direct</span>
            {data.totalDownline > 0 && (
              <>
                <span>•</span>
                <span>{data.totalDownline} total</span>
              </>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-gold font-semibold">{data.points}</div>
          <div className="text-xs text-slate-400">points</div>
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
