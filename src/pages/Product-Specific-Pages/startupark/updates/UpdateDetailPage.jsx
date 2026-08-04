import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUpdate, UPDATE_TYPES } from '../../../../services/startupUpdates';
import { getImageUrl } from '../../../../utils/imageUrls';
import { renderInlineMarkup } from '../../../../utils/inlineMarkup';
import Loader from '../../../../components/Loader';
import ShowcaseImage from '../../../../components/ShowcaseImage';
import LikeButton from '../../../../components/LikeButton';
import CommentsPanel from '../../../../components/CommentsPanel';
import 'boxicons';

// Full-screen zoom for the post's cover image — click to open, click backdrop
// or Escape to close.
const ImageLightbox = ({ src, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-fade-in"
    >
      <img
        src={src}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scale-in"
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
        aria-label="Close"
      >
        <box-icon name="x" size="20px" color="currentColor"></box-icon>
      </button>
    </div>
  );
};

const TYPE_LABEL = Object.fromEntries(UPDATE_TYPES.map((t) => [t.value, t.label]));

const UpdateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [update, setUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    fetchUpdate(id).then(setUpdate).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!update) {
    return (
      <div className="min-h-screen max-w-2xl lg:max-w-[1600px] mx-auto px-4 py-12 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">Update not found.</p>
      </div>
    );
  }

  const startup = update.startupId || {};
  const logoUrl = startup.logo ? getImageUrl(startup.logo) : null;

  return (
    <div className="min-h-screen max-w-2xl lg:max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} className="btn-ghost px-3 py-1.5 text-xs mb-5">
        ← Back
      </button>

      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          {logoUrl ? (
            <img src={logoUrl} alt={startup.companyName} className="w-11 h-11 rounded-xl object-cover border border-black/10 dark:border-white/15 flex-shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold flex-shrink-0">
              {startup.companyName?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-zinc-900 dark:text-white truncate">{startup.companyName || 'A startup'}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(update.publishedAt || update.createdAt).toLocaleString()}</p>
          </div>
          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <LikeButton updateId={update._id} liked={update.liked} likeCount={update.likeCount} />
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full glass-inset text-zinc-500 dark:text-zinc-400">
              {TYPE_LABEL[update.updateType] || update.updateType}
            </span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{update.title}</h1>
        {update.imageUrl && !imgError && (
          <button
            onClick={() => setLightboxOpen(true)}
            className="relative block w-full mb-4 rounded-xl overflow-hidden border border-black/10 dark:border-white/15 group cursor-zoom-in"
          >
            <ShowcaseImage
              src={getImageUrl(update.imageUrl)}
              wrapperClassName="w-full max-h-96"
              imgClassName="w-full max-h-96 object-cover group-hover:scale-[1.02] transition-transform duration-500"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <box-icon name="expand" size="18px" color="currentColor"></box-icon>
              </div>
            </div>
          </button>
        )}
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{renderInlineMarkup(update.body)}</p>

        <div className="mt-6 pt-4 border-t border-black/[0.06] dark:border-white/10">
          <CommentsPanel updateId={update._id} postedBy={update.postedBy} initialCount={update.commentCount} startExpanded />
        </div>
      </div>

      {lightboxOpen && update.imageUrl && (
        <ImageLightbox src={getImageUrl(update.imageUrl)} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
};

export default UpdateDetailPage;
