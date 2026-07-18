#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(MetadataReader, NSObject)

RCT_EXTERN_METHOD(read:(NSString *)path
                  artworkDir:(NSString *)artworkDir
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
