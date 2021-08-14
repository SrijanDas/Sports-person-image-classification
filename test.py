from server.util import classify_image, get_b64_test_image_for_virat, load_saved_artifacts

if __name__ == '__main__':
    load_saved_artifacts()
    print(classify_image(get_b64_test_image_for_virat(), None))
