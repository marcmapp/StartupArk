import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUpdate, toggleUpdateLike, UPDATE_TYPES } from '../../../../services/startupUpdates';
import { getImageUrl } from '../../../../utils/imageUrls';
import { renderInlineMarkup } from '../../../../utils/inlineMarkup';
import Loader from '../../../../components/Loader';
import 'boxicons';

const TYPE_LABEL = Object.fromEntries(UPDATE_TYPES.map((t) => [t.value, t.label]));

const UpdateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [update, setUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    fetchUpdate(id).then(setUpdate).finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await toggleUpdateLike(id);
      setUpdate((u) => ({ ...u, likeCount: res.likeCount }));
    } finally {
      setLiking(false);
    }
  };

  if (loading) return <Loader />;
  if (!update) {
    return (
      <div className="min-h-screen max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">Update not found.</p>
      </div>
    );
  }

  const startup = update.startupId || {};
  const logoUrl = startup.logo ? getImageUrl(startup.logo) : null;

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 sm:px-6 py-8 lg:ml-8">
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
          <span className="ml-auto text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full glass-inset text-zinc-500 dark:text-zinc-400 flex-shrink-0">
            {TYPE_LABEL[update.updateType] || update.updateType}
          </span>
        </div>

        <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{update.title}</h1>
        {update.imageUrl && (
          <img src={getImageUrl(update.imageUrl)} alt="" className="w-full max-h-96 object-cover rounded-xl border border-black/10 dark:border-white/15 mb-4" />
        )}
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{renderInlineMarkup(update.body)}</p>

        <button
          onClick={handleLike}
          disabled={liking}
          className="btn-ghost mt-6 px-4 py-2 text-sm inline-flex items-center gap-2"
        >
          <box-icon name="like" type="solid" size="16px" color="currentColor"></box-icon>
          {update.likeCount ?? 0} {update.likeCount === 1 ? 'Like' : 'Likes'}
        </button>
      </div>
    </div>
  );
};

export default UpdateDetailPage;
