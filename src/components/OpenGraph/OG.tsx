const TEAL_COLOR = '#2eb8b8';

interface OGProps {
  title: string;
  date?: Date;
  tags?: string[];
}

export default function OG({ title, date, tags = [] }: OGProps) {
  // Truncate title if too long (max ~80 chars for readability)
  const displayTitle = title.length > 80
    ? title.slice(0, 77) + '...'
    : title;

  // Limit to 3 tags and truncate long tag names
  const displayTags = tags.slice(0, 3).map(tag =>
    tag.length > 15 ? tag.slice(0, 12) + '...' : tag
  );

  const formattedDate = date
    ? date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null;

  // Adjust font size based on title length
  const titleFontSize = displayTitle.length > 50 ? 48 : 56;

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d1f1f 100%)',
        position: 'relative',
      }}
    >
      {/* Subtle gradient overlay for depth */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at top right, rgba(46, 184, 184, 0.15) 0%, transparent 50%)',
          display: 'flex',
        }}
      />

      {/* Content container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '60px 80px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Top section: Blog name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: TEAL_COLOR,
              fontFamily: 'Lato',
            }}
          >
            AnnatarHe's Blog
          </span>
        </div>

        {/* Middle section: Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <h1
            style={{
              fontSize: titleFontSize,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.2,
              margin: 0,
              fontFamily: 'LXGWWenKai',
              wordBreak: 'break-word',
            }}
          >
            {displayTitle}
          </h1>
        </div>

        {/* Bottom section: Date and Tags */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          {/* Date */}
          <span
            style={{
              fontSize: 20,
              color: '#888888',
              fontFamily: 'Lato',
            }}
          >
            {formattedDate || ''}
          </span>

          {/* Tags */}
          {displayTags.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: 12,
              }}
            >
              {displayTags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    fontSize: 16,
                    color: TEAL_COLOR,
                    padding: '6px 16px',
                    border: `1px solid ${TEAL_COLOR}`,
                    borderRadius: 20,
                    fontFamily: 'Lato',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Decorative bottom border */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${TEAL_COLOR}, transparent)`,
          display: 'flex',
        }}
      />
    </div>
  );
}
