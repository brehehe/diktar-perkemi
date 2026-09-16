import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function HeroBookShowcase({ heroBooks = {}, className = '' }) {
    const book1 = {
        image: heroBooks?.book_1?.image || '/images/cover-1.jpg',
        title: heroBooks?.book_1?.title || 'Buku Modul PERKEMI 1',
        link: heroBooks?.book_1?.link || '',
    };
    const book2 = {
        image: heroBooks?.book_2?.image || '/images/cover-2.jpg',
        title: heroBooks?.book_2?.title || 'Buku Modul PERKEMI 2',
        link: heroBooks?.book_2?.link || '',
    };
    const book3 = {
        image: heroBooks?.book_3?.image || '/images/cover-3.jpg',
        title: heroBooks?.book_3?.title || 'Buku Utama Kurikulum PERKEMI',
        link: heroBooks?.book_3?.link || '',
    };

    const renderBookLink = (book, content) => {
        if (!book.link) {
            return content;
        }
        const isExternal = book.link.startsWith('http://') || book.link.startsWith('https://');
        if (isExternal) {
            return (
                <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full focus:outline-hidden"
                    title={book.title}
                >
                    {content}
                </a>
            );
        }
        return (
            <Link
                href={book.link}
                className="block w-full h-full focus:outline-hidden"
                title={book.title}
            >
                {content}
            </Link>
        );
    };

    return (
        <div className={`relative w-full max-w-lg mx-auto aspect-[4/3] sm:aspect-[16/12] flex items-center justify-center select-none py-6 ${className}`}>
            {/* Ambient Lighting Glows */}
            <div className="absolute inset-0 bg-radial from-[#0B63CE]/12 via-[#EAF5FF]/30 to-transparent blur-3xl -z-10 rounded-full scale-110 pointer-events-none" />
            <div className="absolute w-64 sm:w-80 h-64 sm:h-80 rounded-full border border-[#0B63CE]/15 -z-10 pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full border border-[#DCE7F3]/70 border-dashed -z-10 pointer-events-none" />

            {/* 1. Left / Back Book */}
            <motion.div
                className="absolute z-10 left-4 sm:left-10 md:left-12 top-6 sm:top-8 w-32 sm:w-40 md:w-44 aspect-[1/1.42] rounded-r-md rounded-l-xs overflow-hidden shadow-xl border border-black/10 origin-bottom-left cursor-pointer"
                animate={{
                    y: [0, -10, 0],
                    rotate: [-10, -7, -10],
                }}
                transition={{
                    duration: 5.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                whileHover={{
                    scale: 1.08,
                    rotate: -4,
                    zIndex: 35,
                    transition: { type: 'spring', stiffness: 350, damping: 25 },
                }}
            >
                {renderBookLink(
                    book1,
                    <div className="relative w-full h-full">
                        {/* Spine ridge highlight */}
                        <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 via-white/25 to-transparent z-10 pointer-events-none" />
                        <img
                            src={book1.image}
                            alt={book1.title}
                            className="w-full h-full object-cover"
                            loading="eager"
                        />
                    </div>
                )}
            </motion.div>

            {/* 2. Right / Back Book */}
            <motion.div
                className="absolute z-15 right-4 sm:right-10 md:right-12 top-10 sm:top-12 w-32 sm:w-40 md:w-44 aspect-[1/1.42] rounded-r-md rounded-l-xs overflow-hidden shadow-2xl border border-black/10 origin-bottom-right cursor-pointer"
                animate={{
                    y: [0, -13, 0],
                    rotate: [11, 8, 11],
                }}
                transition={{
                    duration: 5.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.6,
                }}
                whileHover={{
                    scale: 1.08,
                    rotate: 4,
                    zIndex: 35,
                    transition: { type: 'spring', stiffness: 350, damping: 25 },
                }}
            >
                {renderBookLink(
                    book2,
                    <div className="relative w-full h-full">
                        {/* Spine ridge highlight */}
                        <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 via-white/25 to-transparent z-10 pointer-events-none" />
                        <img
                            src={book2.image}
                            alt={book2.title}
                            className="w-full h-full object-cover"
                            loading="eager"
                        />
                    </div>
                )}
            </motion.div>

            {/* 3. Center / Front Hero Book */}
            <motion.div
                className="relative z-25 w-36 sm:w-48 md:w-52 aspect-[1/1.42] rounded-r-md rounded-l-xs overflow-hidden shadow-[0_22px_50px_-12px_rgba(14,39,71,0.38)] border border-black/15 cursor-pointer"
                animate={{
                    y: [0, -8, 0],
                    rotate: [-1.5, 0.5, -1.5],
                }}
                transition={{
                    duration: 4.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1.2,
                }}
                whileHover={{
                    scale: 1.07,
                    rotate: 0,
                    zIndex: 40,
                    transition: { type: 'spring', stiffness: 350, damping: 25 },
                }}
            >
                {renderBookLink(
                    book3,
                    <div className="relative w-full h-full">
                        {/* Spine ridge highlight */}
                        <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/30 via-white/30 to-transparent z-10 pointer-events-none" />
                        {/* Gloss overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/15 pointer-events-none z-10" />
                        <img
                            src={book3.image}
                            alt={book3.title}
                            className="w-full h-full object-cover"
                            loading="eager"
                        />
                    </div>
                )}
            </motion.div>
        </div>
    );
}
