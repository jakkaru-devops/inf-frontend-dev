import { useLocale } from 'hooks/locale.hook';
import { useRouter } from 'next/router';
import {
  useEffect,
  RefObject,
  useState,
  useRef,
  WheelEvent,
  useMemo,
} from 'react';
import {
  IAcatProduct,
  IAcatProductGroupPageProps,
} from 'sections/CatalogExternal/interfaces';
import { useDispatch } from 'react-redux';
import { useAuth } from 'hooks/auth.hook';
import { useCart } from 'hooks/cart.hook';

export const useHandlers = ({ data }: { data: IAcatProductGroupPageProps }) => {
  const imageRef: RefObject<HTMLImageElement> = useRef();
  const pageContentRef: RefObject<HTMLDivElement> = useRef();
  const { locale } = useLocale();
  const router = useRouter();
  const auth = useAuth();
  const cart = useCart();
  const dispatch = useDispatch();

  const { mark, model, group } = data;
  const breadcrumbs = [];
  const labels = data?.labels || null;
  const [scale, setScale] = useState<number>(10);
  const [imageRatio, setImageRatio] = useState({
    ratio: 1,
    scale: 1,
    width: 0,
    height: 0,
  });
  const fieldRef: RefObject<HTMLDivElement> = useRef();
  const imageWapperRef: RefObject<HTMLDivElement> = useRef();
  const fullscreenButtonRef: RefObject<HTMLElement> = useRef();
  const wrapperRef: RefObject<HTMLDivElement> = useRef();
  const [activeLabel, setActiveLabel] = useState<string>(null);

  const getProductIndexInCart = (product: IAcatProduct) =>
    cart.products.findIndex(
      el => String(el.acatProductId) === String(product.id),
    );

  const products = useMemo(
    () =>
      data.numbers.map(item => {
        const index = getProductIndexInCart(item);
        let quantity = 1;
        if (index !== -1) quantity = cart?.products?.[index]?.quantity || 1;
        return {
          ...item,
          quantity,
        };
      }),
    [],
  );

  // const [products, setProducts] = useState(
  //   data.numbers.map(item => {
  //     const index = getProductIndexInCart(item);
  //     let quantity = 1;
  //     if (index !== -1) quantity = cart?.products?.[index]?.quantity || 1;
  //     return {
  //       ...item,
  //       quantity,
  //     };
  //   }),
  // );

  const permissions = {
    addToCart: !auth.isAuthenticated || auth?.currentRole?.label === 'customer',
    addToFavorites:
      auth.isAuthenticated && auth?.currentRole?.label === 'customer',
    addToOrderRequest:
      auth.isAuthenticated &&
      auth?.currentRole?.label === 'seller' &&
      router.query.orderRequestId,
  };

  const onScaleImageHandler = (e: WheelEvent<HTMLImageElement>) => {
    const delta = e.deltaY || e.detail;
    if (delta > 0) {
      setScale(scale - 0.1 < 1 ? 1 : scale - 0.1);
    } else {
      setScale(scale + 0.1);
    }
  };

  useEffect(() => {
    if (!imageRef.current || !imageWapperRef?.current || imageRatio.ratio !== 1)
      return;
    imageRef.current.onload = () => {
      const canvasWidth = imageWapperRef.current.clientWidth;
      const width = imageRef.current.width;
      const height = imageRef.current.height;
      let ratio = height / 500;
      if (width / ratio > canvasWidth) ratio = width / canvasWidth;
      setImageRatio(prev => ({
        ...prev,
        ratio,
        width,
        height,
      }));
    };
  }, [imageRef?.current]);

  useEffect(() => {
    if (!fieldRef.current) return;

    handleControl();

    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    var keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

    function preventDefault(e) {
      e.preventDefault();
    }

    function preventDefaultForScrollKeys(e) {
      if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
      }
    }

    // modern Chrome requires { passive: false } when adding event
    var supportsPassive = false;
    try {
      window.addEventListener(
        'test',
        null,
        Object.defineProperty({}, 'passive', {
          get: function () {
            supportsPassive = true;
          },
        }),
      );
    } catch (e) {}

    var wheelOpt: any = supportsPassive ? { passive: false } : false;
    var wheelEvent =
      'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    // call this to Disable
    function disableScroll() {
      window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
      window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
      window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
      window.addEventListener('keydown', preventDefaultForScrollKeys, false);
    }

    // call this to Enable
    function enableScroll() {
      window.removeEventListener('DOMMouseScroll', preventDefault, false);
      window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
      window.removeEventListener('touchmove', preventDefault, wheelOpt);
      window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
    }

    const div = fieldRef.current;
    div.onmouseover = e => {
      disableScroll();
    };
    div.onmouseleave = e => {
      enableScroll();
    };
  }, []);

  const handleControl = () => {
    const field = fieldRef.current;
    const imageWrapper = imageWapperRef.current;

    let move = false;
    let startPos = {
      x: 0,
      y: 0,
    };
    let position = {
      x: 0,
      y: 0,
    };

    fullscreenButtonRef.current.onclick = () => {
      setScale(10);
      move = false;
      startPos = {
        x: 0,
        y: 0,
      };
      position = {
        x: 0,
        y: 0,
      };
      imageWrapper.style.marginLeft = `0px`;
      imageWrapper.style.marginTop = `0px`;
    };

    field.onmousedown = e => {
      // console.log(e);
      console.log('DOWN');
      move = true;
      startPos = {
        x: e.screenX,
        y: e.screenY,
      };
    };
    field.onmouseup = e => {
      console.log('UP');
      move = false;
      const dif = {
        x: e.screenX - startPos.x,
        y: e.screenY - startPos.y,
      };
      position = {
        x: position.x + dif.x,
        y: position.y + dif.y,
      };
    };
    field.onmouseleave = e => {
      console.log('LEAVE');
      move = false;
      const dif = {
        x: e.screenX - startPos.x,
        y: e.screenY - startPos.y,
      };
      position = {
        x: position.x + dif.x,
        y: position.y + dif.y,
      };
    };
    field.onmousemove = e => {
      if (!move) return;
      // console.log(e);
      // console.log('MOVE');
      const newPos = {
        x: e.screenX - startPos.x,
        y: e.screenY - startPos.y,
      };
      console.log(startPos);
      // console.log(position);

      imageWrapper.style.marginLeft = `${position.x + newPos.x}px`;
      imageWrapper.style.marginTop = `${position.y + newPos.y}px`;

      // scroller.style.transform = `scale(${scale / 10}) translate(${
      //   position.x + newPos.x
      // }px, ${position.y + newPos.y})`;

      // setPosition(prev => ({
      //   x: e.screenX - startPos.x,
      //   y: e.screenY - startPos.y,
      // }));
    };
  };

  const getProductData = (product: IAcatProduct) => ({
    id: product.id,
    name: product.name,
    article: product.number,
    autoType: data?.type?.id,
    autoBrand: mark.name,
    autoModel: model.name,
    group: group?.name,
  });

  return {
    imageRef,
    pageContentRef,
    locale,
    router,
    auth,
    cart,
    dispatch,
    mark,
    model,
    group,
    labels,
    breadcrumbs,
    activeLabel,
    setActiveLabel,
    imageRatio,
    permissions,
    products,
    wrapperRef,
    scale,
    setScale,
    fullscreenButtonRef,
    fieldRef,
    imageWapperRef,
    onScaleImageHandler,
    getProductData,
  };
};
