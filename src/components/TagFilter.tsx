
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagFilterProps {
  selectedTag: string | null;
  onTagChange: (tagId: string | null) => void;
}

const TagFilter = ({ selectedTag, onTagChange }: TagFilterProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3">
        <Button
          variant={selectedTag === null ? "default" : "outline"}
          size="sm"
          onClick={() => onTagChange(null)}
          className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 shadow-sm"
        >
          全部
        </Button>
        {tags.map((tag) => (
          <Button
            key={tag.id}
            variant={selectedTag === tag.id ? "default" : "outline"}
            size="sm"
            onClick={() => onTagChange(selectedTag === tag.id ? null : tag.id)}
            className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 shadow-sm"
          >
            {tag.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TagFilter;
