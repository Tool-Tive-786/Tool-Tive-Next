import Link from 'next/link';

interface ArticleCardProps {
    title: string;
    description: string;
    category: string;
    slug: string;
    pubDate: string;
}

export default function ArticleCard({ title, description, category, slug, pubDate }: ArticleCardProps) {
    const formattedDate = new Date(pubDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const formattedCategory = category.replace(/-/g, ' ');

    let iconClass = "fas fa-book-open";
    if (category.toLowerCase() === 'design') iconClass = "fas fa-image";
    if (category.toLowerCase() === 'security') iconClass = "fas fa-shield-alt";
    if (category.toLowerCase() === 'business') iconClass = "fas fa-briefcase";
    if (category.toLowerCase() === 'writing') iconClass = "fas fa-pen";

    // Provide initial author based on category or default
    let authorInitial = "T";
    let authorName = "ToolTive Team";
    let authorRole = "Content Writer";

    if (category.toLowerCase() === 'design') {
        authorInitial = "A";
        authorName = "Ahmed Raza";
        authorRole = "Tech Editor";
    } else if (category.toLowerCase() === 'security') {
        authorInitial = "S";
        authorName = "Sarah Khan";
        authorRole = "Security Analyst";
    }

    return (
        <Link href={`/blog/${category}/${slug}`} className="blog-card" itemProp="blogPost" itemScope itemType="https://schema.org/BlogPosting">
            <div className="blog-image-wrap">
                <i className={`${iconClass} blog-image-placeholder`} aria-hidden="true"></i>
                <span className="blog-category" itemProp="articleSection">{formattedCategory}</span>
            </div>
            <div className="blog-card-body">
                <div className="blog-meta">
                    <span><i className="far fa-clock"></i> <time itemProp="datePublished" dateTime={pubDate}>{formattedDate}</time></span>
                    <span><i className="far fa-hourglass"></i> 5 min read</span>
                </div>
                <h3 itemProp="headline">{title}</h3>
                <p className="blog-excerpt" itemProp="description">
                    {description}
                </p>
            </div>
            <footer className="blog-card-footer">
                <div className="blog-author" itemProp="author" itemScope itemType="https://schema.org/Person">
                    <div className="author-avatar" itemProp="name">{authorInitial}</div>
                    <div className="author-info">
                        <span className="author-name" itemProp="name">{authorName}</span>
                        <span className="author-role">{authorRole}</span>
                    </div>
                </div>
                <div className="read-more" aria-label="Read article">
                    <i className="fas fa-arrow-right"></i>
                </div>
            </footer>
        </Link>
    );
}