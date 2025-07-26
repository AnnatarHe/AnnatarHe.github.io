const primaryColor = 'oklch(71.33% 0.112 194.94)'
const ratio = 1.5
const logo = 'https://ik.imagekit.io/annatarhe/asynctalk-logo.png?updatedAt=1716360363124'

const titleFontSize = 3 * ratio
const descriptionFontSize = 1.6 * ratio
const logoSize = 146 * ratio
export default function OG({
  title = "AsyncTalk - 和我们一起，将 Web 开发带向下一个高度",
  ep,
  sp
}: {
  title: string,
  ep?: number
  sp?: number
  heroImageURL?: string
}
) {
  return (
    <div
      style={{
        display: 'flex',
        width: "100%",
        height: "100%",
        backgroundColor: "black",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: 'center',
          width: "100%",
          height: "100%",
          padding: '0 1rem',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          alignItems: "center",
          position: "relative",
        }}
      >
        <img
          src={logo}
          width={logoSize * 2}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: `${titleFontSize}rem`,
              textOverflow: "ellipsis",
              overflow: "hidden",
              fontWeight: "bold",
              maxWidth: "40rem",
              fontFamily: "LXGWWenKai",
              wordBreak: "break-word",
              // color: primaryColor,
              color: 'white',
              margin: '1rem 0'
            }}
          >
            {title}
          </h1>
          <p>
            <span style={{ fontSize: `${descriptionFontSize}rem`, color: primaryColor }}>
              Async Talk (asynctalk.com)
            </span>
            <span style={{ margin: '0 0.5rem', fontSize: `${descriptionFontSize}rem`, color: primaryColor }}>
              -
            </span>
            <span style={{ fontSize: `${descriptionFontSize}rem`, color: primaryColor }}>
              {ep ? 'Episode' : 'Special'} {ep ?? sp}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}