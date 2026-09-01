"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import SliderLib from "react-slick";
import type { Settings } from "react-slick";
type SliderType = InstanceType<typeof SliderLib>;
type SliderProps = Settings & { ref?: React.Ref<SliderType>; className?: string };
const Slider = SliderLib as unknown as React.ComponentType<SliderProps>;
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

const ThumbnailCarousel: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const mainSliderRef = useRef<SliderType | null>(null);
    const navSliderRef = useRef<SliderType | null>(null);

    const settingsFor = {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: true,
        asNavFor: navSliderRef.current as SliderType, // Ensure proper typing
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    fade: true,
                    asNavFor: navSliderRef.current as SliderType,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    fade: true,
                    asNavFor: navSliderRef.current as SliderType,
                },
            },
        ],
    };

    const settingsNav = {
        slidesToShow: 3,
        slidesToScroll: 1,
        asNavFor: mainSliderRef.current as SliderType, // Ensure proper typing
        dots: true,
        centerMode: true,
        focusOnSelect: true,
        beforeChange: (oldIndex: number, newIndex: number) =>
            setActiveIndex(newIndex),
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    centerMode: true,
                    focusOnSelect: true,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    centerMode: true,
                    focusOnSelect: true,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    centerMode: true,
                    focusOnSelect: true,
                },
            },
        ],
    };

    useEffect(() => {
        if (mainSliderRef.current) {
            mainSliderRef.current.slickGoTo(activeIndex);
        }
    }, [activeIndex]);

    return (
        <>
            <div>
                <Slider {...settingsFor} ref={mainSliderRef} className="pb-3">
                    <div>
                        <Image
                            src="/images/ThumbnailSlider/personalloan.jpg"
                            alt="Conference"
                            width={0}
                            height={0}
                            quality={100}
                            layout="responsive"
                            sizes="100vh"
                            className="rounded-lg"
                        />
                    </div>
                    <div>
                        <Image
                            src="/images/ThumbnailSlider/businessloan.webp"
                            alt="Conference"
                            width={0}
                            height={0}
                            quality={100}
                            layout="responsive"
                            sizes="100vh"
                            className="rounded-lg"
                        />
                    </div>
                    <div>
                        <Image
                            src="/images/ThumbnailSlider/homeloan.jpeg"
                            alt="Conference"
                            width={0}
                            height={0}
                            quality={100}
                            layout="responsive"
                            sizes="100vh"
                            className="rounded-lg"
                        />
                    </div>
                    <div>
                        <Image
                            src="/images/ThumbnailSlider/loanagainstproperty.jpeg"
                            alt="Conference"
                            width={0}
                            height={0}
                            quality={100}
                            layout="responsive"
                            sizes="100vh"
                            className="rounded-lg"
                        />
                    </div>
                </Slider>
                <Slider {...settingsNav} ref={navSliderRef} className="thumb">
                    <div>
                        <Image
                            src="/images/ThumbnailSlider/personalloan.jpg"
                            alt="Thumbnail"
                            width={0}
                            height={0}
                            quality={100}
                            layout="responsive"
                            sizes="100vh"
                            className="rounded-lg"
                        />
                    </div>
                    <div>
                        <Image
                            src="/images/ThumbnailSlider/businessloan.webp"
                            alt="Thumbnail"
                            width={0}
                            height={0}
                            quality={100}
                            layout="responsive"
                            sizes="100vh"
                            className="rounded-lg"
                        />
                    </div>
                    <div>
                        <Image
                            src="/images/ThumbnailSlider/homeloan.jpeg"
                            alt="Thumbnail"
                            width={0}
                            height={0}
                            quality={100}
                            layout="responsive"
                            sizes="100vh"
                            className="rounded-lg"
                        />
                    </div>
                    <div>
                        <Image
                            src="/images/ThumbnailSlider/loanagainstproperty.jpeg"
                            alt="Thumbnail"
                            width={0}
                            height={0}
                            quality={100}
                            layout="responsive"
                            sizes="100vh"
                            className="rounded-lg"
                        />
                    </div>
                </Slider>
            </div>
        </>
    );
};

export default ThumbnailCarousel;
